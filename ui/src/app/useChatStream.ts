import { useRef } from "react";

export function useChatStream() {
  const abortRef = useRef<AbortController | null>(null);

  // Start streaming from backend
  const startStream = async (
    userMessage: string,
    onToken: (token: string) => void,
    onDone: () => void,
    onError: (err: any) => void
  ) => {
    abortRef.current = new AbortController();
    try {
      const res = await fetch("/api/stream", {
        method: "POST",
        body: JSON.stringify({ message: userMessage }),
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
      });
      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        if (doneReading) break;
        const chunk = decoder.decode(value);
        onToken(chunk);
      }
      onDone();
    } catch (err) {
      if (abortRef.current.signal.aborted) return;
      onError(err);
    }
  };

  // Abort streaming
  const stopStream = () => {
    abortRef.current?.abort();
  };

  return { startStream, stopStream };
}
