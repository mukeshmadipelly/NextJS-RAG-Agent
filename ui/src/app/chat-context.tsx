"use client";
import React, { createContext, useContext, useMemo, useState } from "react";

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

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createEmptyChat(): ChatSession {
  return {
    id: makeId(),
    title: "New chat",
    messages: [],
  };
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [{ chats, activeChatId }, setState] = useState<{
    chats: ChatSession[];
    activeChatId: string;
  }>(() => {
    const first = createEmptyChat();
    return { chats: [first], activeChatId: first.id };
  });

  const activeChat = useMemo(() => {
    const found = chats.find((c) => c.id === activeChatId);
    return found ?? chats[0];
  }, [chats, activeChatId]);

  const newChat = () => {
    const c = createEmptyChat();
    setState((prev) => ({ chats: [c, ...prev.chats], activeChatId: c.id }));
  };

  const selectChat = (id: string) => {
    setState((prev) => ({ ...prev, activeChatId: id }));
  };

  const clearActiveChat = () => {
    if (!activeChat) return;
    setState((prev) => ({
      ...prev,
      chats: prev.chats.map((c) => (c.id === activeChat.id ? { ...c, messages: [] } : c)),
    }));
  };

  const deleteChat = (chatId: string) => {
    setState((prev) => {
      const remaining = prev.chats.filter((c) => c.id !== chatId);
      if (remaining.length === prev.chats.length) return prev;

      if (prev.activeChatId !== chatId) {
        return { ...prev, chats: remaining };
      }

      if (remaining.length > 0) {
        return { chats: remaining, activeChatId: remaining[0].id };
      }

      const fresh = createEmptyChat();
      return { chats: [fresh], activeChatId: fresh.id };
    });
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
    setState((prev) => ({
      ...prev,
      chats: prev.chats.map((c) => (c.id === activeChat.id ? { ...c, title } : c)),
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
