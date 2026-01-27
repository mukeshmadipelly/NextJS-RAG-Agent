"use client";
import React, { useState } from "react";

export default function MessageInput({
  onSend,
  onStop,
  streaming,
}: {
  onSend: (msg: string) => void;
  onStop: () => void;
  streaming: boolean;
}) {
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    onSend(input);
    setInput("");
  };

  return (
    <form onSubmit={handleSend} className="flex gap-2 p-2 border-t bg-gray-100 dark:bg-gray-900">
      <input
        className="flex-1 px-3 py-2 border rounded focus:outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        disabled={streaming}
      />
      {streaming ? (
        <button
          type="button"
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={onStop}
        >
          Stop
        </button>
      ) : (
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Send
        </button>
      )}
    </form>
  );
}
