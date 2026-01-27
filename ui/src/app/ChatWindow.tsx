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

  // Send user message and start streaming agent response
  const handleSend = (msg: string) => {
    const chatId = activeChatId;

    if (activeChat.title === "New chat" && activeChat.messages.length === 0) {
      setActiveTitle(msg.slice(0, 32));
    }

    updateActiveMessages((msgs) => [...msgs, { sender: "user", text: msg }, { sender: "agent", text: "" }]);
    setStreaming(true);
    setStreamingChatId(chatId);

    // Stream agent response
    startStream(
      msg,
      (token) => {
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
      },
      () => {
        setStreaming(false);
        setStreamingChatId(null);
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
