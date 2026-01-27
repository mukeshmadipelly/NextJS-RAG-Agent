"use client";
import React, { useMemo, useState } from "react";
import { useChats } from "./chat-context";

export default function Sidebar({
  open,
  onClose,
  onOpen,
}: {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}) {
  const { chats, activeChatId, selectChat, deleteChat } = useChats();
  const [pendingDeleteChatId, setPendingDeleteChatId] = useState<string | null>(null);

  const pendingDeleteChat = useMemo(() => {
    if (!pendingDeleteChatId) return null;
    return chats.find((c) => c.id === pendingDeleteChatId) ?? null;
  }, [chats, pendingDeleteChatId]);

  // Only render sidebar if open
  if (!open) return null;
  return (
    <aside
      className="h-full w-64 min-w-[16rem] flex flex-col transition-transform duration-300"
      aria-label="Sidebar"
    >
      <div className="flex items-center justify-end h-16 px-4 border-b dark:border-gray-700">
      <div className="flex items-center justify-between w-full">
        <span />
        {/* Sidebar close button (☰) at top-right of sidebar */}
        <button onClick={onClose} aria-label="Close sidebar" className="p-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
          ☰
        </button>
      </div>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Fake chat history */}
        <div className="text-gray-700 dark:text-gray-200 font-semibold mb-2">Chats</div>
        {chats.map((c) => (
          <div
            key={c.id}
            className={`rounded px-3 py-2 cursor-pointer border ${
              c.id === activeChatId
                ? "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-500"
                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-transparent"
            }`}
            onClick={() => {
              selectChat(c.id);
              onOpen();
            }}
            title={c.title}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate">{c.title || "Untitled"}</span>
              <button
                type="button"
                aria-label={`Delete ${c.title || "chat"}`}
                className="shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  setPendingDeleteChatId(c.id);
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </nav>
      <div className="p-4 border-t dark:border-gray-700">
        <button className="w-full py-2 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center gap-2">
          <span>⚙️</span> <span>Settings</span>
        </button>
      </div>

      {pendingDeleteChat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-label="Delete chat dialog"
          onClick={() => setPendingDeleteChatId(null)}
        >
          <div
            className="w-[92%] max-w-sm rounded-lg bg-gray-100 dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-semibold text-gray-900 dark:text-gray-100">Delete chat</div>
            <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Are you sure you want to delete <span className="font-medium">{pendingDeleteChat.title || "Untitled"}</span>?
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => setPendingDeleteChatId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  deleteChat(pendingDeleteChat.id);
                  setPendingDeleteChatId(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
