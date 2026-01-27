import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./theme-context";
import { ChatProvider } from "./chat-context";

export const metadata: Metadata = {
  title: "ChatGPT-Style RAG UI",
  description: "Production-grade chat UI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const t = localStorage.getItem('theme');
    const isDark = t === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
  } catch {}
})();`,
          }}
        />
      </head>
      <body className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <ThemeProvider>
          <ChatProvider>{children}</ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
