"use client";

import { useRef, useState } from "react";
import { EvalComponent } from "@/components/EvalComponent";

class Message {
  role: "user" | "ai" | "system" | "tool";
  content: string;

  constructor(role: "user" | "ai" | "system" | "tool", content: string) {
    this.role = role;
    this.content = content;
  }
}

class Suggestion {
  source: string;
  prompt: string;

  constructor(source: string, prompt: string) {
    this.source = source;
    this.prompt = prompt;
  }
}
const defaultSuggestions = [
  new Suggestion(
    "https://pubmed.ncbi.nlm.nih.gov/39645377/",
    "Summarize a medical Publication"
  ),
  new Suggestion(
    "https://www.investopedia.com/articles/investing/080615/how-to-use-chatbots-in-trading.html",
    "Explain how to use a chatbot for trading"
  ),
  new Suggestion(
    "https://blog.google/technology/google-deepmind/google-gemini-ai-update-december-2024/#ceo-message",
    "What's new in Gemini"
  ),
];

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! How can I help you today?" },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleKeyPress = () => {
    console.log("TODO: Implement later");
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    // Add user message to the conversation
    const userMessage = { role: "user" as const, content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      // TODO: Handle the response from the chat API to display the AI response in the UI
    } catch (error) {
      console.error("Error:", error);
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
        <EvalComponent />
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
          {/* Suggestion area*/}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2 hide-scrollbar -mx-2 px-2">
            {defaultSuggestions.map((suggestion, index) => (
              <button
                key={index}
                className="flex gap-2 p-2 text-gray-400 hover:text-gray-600 border border-gray-700"
                onClick={() =>
                  setMessage(`${suggestion.prompt} ${suggestion.source}`)
                }
              >
                {suggestion.prompt}
              </button>
            ))}
          </div>

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
