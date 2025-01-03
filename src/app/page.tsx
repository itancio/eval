"use client";

import { useRef, useState } from "react";
import { EvalComponent } from "@/components/EvalComponent";
import type { JsonValue } from "./types";

class Message {
  role: "user" | "ai" | "system" | "tool";
  content: string;

  constructor(role: "user" | "ai" | "system" | "tool", content: string) {
    this.role = role;
    this.content = content;
  }
}

type Conversation = {
  id: string;
  messages: Message[];
  createdAt: Date;
  title: string;
};

const defaultSuggestions = [
  "Who can I claim as dependents",
  "Summarize a publication https://www.irs.gov/pub/irs-pdf/p17.pdf",
  "What's new in Gemini https://blog.google/technology/google-deepmind/google-gemini-ai-update-december-2024/#ceo-message",
];

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hello! How can I help you today?" },
  ]);
  const [messagesHistory, setMessagesHistory] = useState<Conversation>({
    id: crypto.randomUUID(),
    messages: [new Message("ai", "Hello! How can I help you today?")],
    createdAt: new Date(),
    title: "New Chat",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(defaultSuggestions);
  const [error, setError] = useState(null);
  const [trace, setTrace] = useState<string[]>([]);

  const handleKeyPress = () => {
    console.log("TODO: Implement later");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    console.log(`TODO: Implement later, ${suggestion}`);
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    // Add user message to the conversation
    const userMessage = { role: "user" as const, content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    setError(null);
    setSuggestions([]); // Clear suggestions after sending a message
    setTrace([]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader from response body");

      const decoder = new TextDecoder();

      await reader.read().then(async function processText({ done, value }) {
        if (done) return;

        const chunk = decoder.decode(value, { stream: true });
        console.log("Chunks decoded:", chunk);

        setTrace(prev => {
          return [...prev, chunk];
        });

        //????????????????????????????????
        //  TODO: Store tracing information in database

        await reader.read().then(processText);
      });
    } catch (error) {
      console.error("Error during fetch:", error);
      setMessages(prevMessages => [
        ...prevMessages,
        new Message("system", "An error occurred. Please try again."),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="flex flex-col h-screen bg-[#141720]">
      {/* Header */}
      <div
        className="w-full  p-4
      bg-[#101014]
        border-b border-gray-700"
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold text-white">
            Evaluation for RAG chat
          </h1>
        </div>
      </div>
      <div
        className="relative top-0 left-0 w-full h-[1px]
                bg-gradient-to-r from-[#201cff] to-[#13ef95]"
      />
      <div className="flex flex-col md:flex-row h-screen">
        {/* Messages Column */}
        <div className="flex-1 md:w-1/2 overflow-auto pb-32 pt-4">
          <div className="max-w-4xl mx-auto p-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-4 mb-4 ${
                  msg.role === "user"
                    ? "justify-start"
                    : "justify-end flex-row-reverse"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                    msg.role === "user"
                      ? "border-2 border-[#13ef95] text-[#13ef95] ml-auto"
                      : "text-gray-100"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 mb-4">
                <div className="animate-pulse">...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Evaluation Column */}
        <EvalComponent eval={trace} />
      </div>

      {/* Footer Area */}
      <div
        className="fixed 
        bottom-0 w-full p-4
        bg-[#101014]
        border-t border-gray-700"
      >
        <div
          className="absolute top-0 left-0 w-full h-[1px]
                bg-gradient-to-r from-[#201cff] to-[#13ef95]"
        />
        <div className="max-w-3xl mx-auto">
          {/* Suggestions Area */}
          {suggestions.length > 0 && (
            <div className="py-4 animate-slideUp">
              <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-3 px-16 lg:px-24">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <div
                    key={index}
                    className="group relative transform transition-all duration-300 hover:scale-105"
                  >
                    <button
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-5 py-2.5 bg-gray-800/40 hover:bg-[#13ef95]
              rounded-full text-sm text-gray-300 hover:text-white
              transition-all border border-white/10 hover:border-cyan-500/30
              backdrop-blur-sm shadow-lg shadow-black/20 hover:shadow-cyan-500/20
              flex items-center justify-center gap-2 group"
                    >
                      <span className="truncate max-w-[200px]">
                        {suggestion.length > 40
                          ? suggestion.substring(0, 37) + "..."
                          : suggestion}
                      </span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-cyan-400">
                        ↗
                      </span>
                    </button>
                    <div
                      className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 
            scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 
            transition-all duration-300 ease-out pointer-events-none"
                    >
                      <div
                        className="bg-gray-900/90 border border-white/10 px-4 py-2.5 
              rounded-xl shadow-2xl backdrop-blur-xl 
              text-sm text-gray-200 max-w-xs whitespace-normal
              animate-tooltipAppear"
                      >
                        {suggestion}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Field Area */}
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400"
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-[#13ef95] text-gray-700 px-5 py-3 rounded-xl hover:bg-cyan-900 transition-all disabled:bg-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
