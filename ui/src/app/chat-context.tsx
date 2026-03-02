"use client";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

export interface ChatMessage {
  sender: "user" | "agent";
  text: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
}

interface ChatContextValue {
  chats: ChatSession[];
  activeChatId: string;
  activeChat: ChatSession;
  newChat: () => void;
  selectChat: (id: string) => void;
  clearActiveChat: () => void;
  deleteChat: (chatId: string) => void;
  updateActiveMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void;
  updateMessagesByChatId: (chatId: string, updater: (prev: ChatMessage[]) => ChatMessage[]) => void;
  setActiveTitle: (title: string) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

async function apiJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { cache: "no-store", ...init });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const msg = text || `Request failed: ${res.status}`;
    const error = new Error(msg);
    // @ts-expect-error augment for callers that want status
    (error as any).status = res.status;
    throw error;
  }
  return (await res.json()) as T;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [{ chats, activeChatId }, setState] = useState<{
    chats: ChatSession[];
    activeChatId: string;
  }>(() => {
    // Temporary initial state; we replace it from DB on mount.
    return { chats: [{ id: "local", title: "Loading…", messages: [] }], activeChatId: "local" };
  });

  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        const existing = await apiJson<ChatSession[]>("/api/chats");
        if (cancelled) return;

        let nextChats = existing;
        if (nextChats.length === 0) {
          const created = await apiJson<ChatSession>("/api/chats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "New chat" }),
          });
          nextChats = [created];
        }

        const storedActive = (() => {
          try {
            return localStorage.getItem("activeChatId");
          } catch {
            return null;
          }
        })();

        const preferred = storedActive && nextChats.find((c) => c.id === storedActive) ? storedActive : nextChats[0].id;
        setState({ chats: nextChats, activeChatId: preferred });
      } catch (e: any) {
        // If backend isn't reachable or chats route is missing, keep a local-only chat.
        const status = e?.status as number | undefined;
        const message = (e && (e as Error).message) || "";
        const isNotFound = status === 404 || message.includes('"detail":"Not Found"');
        if (!isNotFound) {
          // Only log non-404 errors to avoid noisy console during development.
          console.error("Failed to load chats:", e);
        }
        setState({ chats: [{ id: "local", title: "New chat", messages: [] }], activeChatId: "local" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeChat = useMemo(() => {
    const found = chats.find((c) => c.id === activeChatId);
    return found ?? chats[0];
  }, [chats, activeChatId]);

  const newChat = () => {
    (async () => {
      try {
        const c = await apiJson<ChatSession>("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "New chat" }),
        });
        setState((prev) => ({ chats: [c, ...prev.chats.filter((x) => x.id !== "local")], activeChatId: c.id }));
        try {
          localStorage.setItem("activeChatId", c.id);
        } catch {}
      } catch (e) {
        console.error("Failed to create chat:", e);
      }
    })();
  };

  const selectChat = (id: string) => {
    setState((prev) => ({ ...prev, activeChatId: id }));
    try {
      localStorage.setItem("activeChatId", id);
    } catch {}
  };

  const clearActiveChat = () => {
    if (!activeChat) return;
    if (activeChat.id !== "local") {
      apiJson<ChatSession>(`/api/chats/${activeChat.id}/messages`, { method: "DELETE" }).catch((e) =>
        console.error("Failed to clear messages:", e)
      );
    }
    setState((prev) => ({
      ...prev,
      chats: prev.chats.map((c) => (c.id === activeChat.id ? { ...c, messages: [] } : c)),
    }));
  };

  const deleteChat = (chatId: string) => {
    if (chatId !== "local") {
      apiJson(`/api/chats/${chatId}`, { method: "DELETE" }).catch((e) => console.error("Failed to delete chat:", e));
    }
    setState((prev) => {
      const remaining = prev.chats.filter((c) => c.id !== chatId);
      if (remaining.length === prev.chats.length) return prev;

      if (prev.activeChatId !== chatId) {
        return { ...prev, chats: remaining };
      }

      if (remaining.length > 0) {
        try {
          localStorage.setItem("activeChatId", remaining[0].id);
        } catch {}
        return { chats: remaining, activeChatId: remaining[0].id };
      }

      // No chats left in UI state: immediately create a new one in DB.
      return { chats: [{ id: "local", title: "Loading…", messages: [] }], activeChatId: "local" };
    });
    // If we deleted the last chat, create a fresh one (async).
    if (activeChatId === chatId) newChat();
  };

  const updateActiveMessages = (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    if (!activeChat) return;
    setState((prev) => ({
      ...prev,
      chats: prev.chats.map((c) => (c.id === activeChat.id ? { ...c, messages: updater(c.messages) } : c)),
    }));
  };

  const updateMessagesByChatId = (chatId: string, updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setState((prev) => ({
      ...prev,
      chats: prev.chats.map((c) => (c.id === chatId ? { ...c, messages: updater(c.messages) } : c)),
    }));
  };

  const setActiveTitle = (title: string) => {
    if (!activeChat) return;
    const trimmed = title.trim();
    if (activeChat.id !== "local") {
      apiJson(`/api/chats/${activeChat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed || "New chat" }),
      }).catch((e) => console.error("Failed to update title:", e));
    }
    setState((prev) => ({
      ...prev,
      chats: prev.chats.map((c) => (c.id === activeChat.id ? { ...c, title: trimmed || c.title } : c)),
    }));
  };

  const value: ChatContextValue = {
    chats,
    activeChatId: activeChat.id,
    activeChat,
    newChat,
    selectChat,
    clearActiveChat,
    deleteChat,
    updateActiveMessages,
    updateMessagesByChatId,
    setActiveTitle,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChats() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChats must be used within ChatProvider");
  return ctx;
}
