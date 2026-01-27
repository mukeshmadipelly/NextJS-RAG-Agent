"use client";
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import { useChats } from "./chat-context";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default open on desktop
  const { newChat, clearActiveChat } = useChats();

  return (
    <div className="flex flex-row h-screen w-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar: width toggled, always present in DOM for layout */}
      <div
        className={`transition-all duration-300 h-full bg-gray-100 dark:bg-gray-800 shadow-lg flex flex-col
          ${sidebarOpen ? "w-64 min-w-[16rem]" : "w-0 min-w-0"}
          md:relative z-30
        `}
        style={{ overflow: sidebarOpen ? "visible" : "hidden" }}
      >
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpen={() => setSidebarOpen(true)} />
      </div>
      {/* Main chat area: flex-1 always, fills remaining space */}
      <div className="flex flex-col flex-1 h-full">
        {/* Top bar */}
        <header className="relative flex items-center justify-between h-16 px-4 border-b dark:border-gray-700 bg-gray-100 dark:bg-gray-900 shadow-sm">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <button
                className="p-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                ☰
              </button>
            )}
            <button
              className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              onClick={newChat}
              aria-label="New chat"
              type="button"
            >
              New
            </button>
            <button
              className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              onClick={clearActiveChat}
              aria-label="Clear chat"
              type="button"
            >
              Clear
            </button>
          </div>
          {/* Centered RAG Chat title */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-lg tracking-tight select-none">RAG Chat</div>
          <ThemeToggle />
        </header>
        {/* Main chat area fills all space below top bar */}
        <main className="flex-1 flex flex-col h-0 min-h-0">{children}</main>
      </div>
    </div>
  );
}
