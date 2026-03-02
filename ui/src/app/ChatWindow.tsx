"use client";
import React, { useState } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useChatStream } from "./useChatStream";
import { useChats } from "./chat-context";

export default function ChatWindow() {
  const { activeChatId, activeChat, updateActiveMessages, updateMessagesByChatId, setActiveTitle } = useChats();
  const [streaming, setStreaming] = useState(false);
  const [streamingChatId, setStreamingChatId] = useState<string | null>(null);
  const { startStream, stopStream } = useChatStream();

  const persistMessage = async (chatId: string, sender: "user" | "agent", text: string) => {
    if (chatId === "local") return;
    try {
      await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender, text }),
        cache: "no-store",
      });
    } catch (e) {
      console.error("Failed to persist message:", e);
    }
  };

  // Send user message and start streaming agent response
  const handleSend = (msg: string) => {
    const chatId = activeChatId;

    if (activeChat.title === "New chat" && activeChat.messages.length === 0) {
      setActiveTitle(msg.slice(0, 32));
    }

    updateActiveMessages((msgs) => [...msgs, { sender: "user", text: msg }, { sender: "agent", text: "" }]);
    setStreaming(true);
    setStreamingChatId(chatId);

    // Persist the user's message immediately (best-effort)
    void persistMessage(chatId, "user", msg);

    // Stream agent response
    let agentText = "";
    let persistedAgent = false;
    startStream(
      msg,
      (token) => {
        agentText += token;
        updateMessagesByChatId(chatId, (msgs) => {
          const last = msgs[msgs.length - 1];
          if (last?.sender === "agent") {
            return [...msgs.slice(0, -1), { ...last, text: last.text + token }];
          }
          return msgs;
        });
      },
      () => {
        setStreaming(false);
        setStreamingChatId(null);
        if (!persistedAgent) {
          persistedAgent = true;
          void persistMessage(chatId, "agent", agentText);
        }
      },
      () => {
        setStreaming(false);
        setStreamingChatId(null);
        if (!persistedAgent && agentText.trim()) {
          persistedAgent = true;
          void persistMessage(chatId, "agent", agentText);
        }
      }
    );
  };

  // Stop streaming
  const handleStop = () => {
    stopStream();
    setStreaming(false);
    setStreamingChatId(null);
  };

  const isActiveStreaming = streaming && streamingChatId === activeChatId;

  return (
    <div className="flex flex-col flex-1 h-full w-full px-4 md:px-12 lg:px-32">
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={activeChat.messages} streaming={isActiveStreaming} />
      </div>
      <div className="sticky bottom-0 w-full bg-gray-100 dark:bg-gray-900 border-t dark:border-gray-700 z-10 pb-2">
        <MessageInput onSend={handleSend} onStop={handleStop} streaming={isActiveStreaming} />
      </div>
    </div>
  );
}
