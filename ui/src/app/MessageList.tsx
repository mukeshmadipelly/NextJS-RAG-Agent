"use client";
import React, { useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  sender: "user" | "agent";
  text: string;
}

function normalizeAgentText(text: string) {
  const t = text ?? "";

  // If the model emits bullets in a single line like:
  // "- A - B - C" => convert to real markdown lines.
  if (t.includes(" - ") && !t.includes("\n-")) {
    const withNewlines = t.replace(/\s-\s/g, "\n- ");
    return withNewlines.startsWith("- ") ? withNewlines : withNewlines.replace(/^\n- /, "- ");
  }

  return t;
}

export default function MessageList({ messages, streaming }: { messages: Message[]; streaming: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll logic
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming, autoScroll]);

  // Pause auto-scroll if user scrolls up
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // If user is within 60px of bottom, enable auto-scroll
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 60);
  };

  return (
    <div
      ref={scrollRef}
      className="flex flex-col gap-4 px-0 py-6 md:px-0 h-full w-full overflow-y-auto scrollbar-hide bg-transparent"
      onScroll={handleScroll}
      style={{ scrollbarWidth: "none", paddingBottom: 80 }}
    >
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`w-full flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`px-4 py-2 rounded-lg max-w-2xl break-words text-base shadow-sm ${
              msg.sender === "user"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            }`}
          >
            {msg.sender === "agent" ? (
              <div className="chat-markdown">
                {msg.text === "" && streaming && idx === messages.length - 1 ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse">Thinking </div>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{normalizeAgentText(msg.text)}</ReactMarkdown>
                )}
              </div>
            ) : (
              <span className="whitespace-pre-wrap">{msg.text}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
