"use client";

import { aiTutorChat } from "@/lib/api";
import { ChatMessage } from "@/types/course";
import { CourseDetail } from "@/types/language";
import { useState } from "react";

interface ChatInterfaceProps {
  courseDetails: CourseDetail;
}

export default function ChatInterface({ courseDetails }: ChatInterfaceProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      message:
        "Hi! I'm here to help you understand this course better. Ask me anything about the video content or concepts covered!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setError(null);

    // Add user message to chat
    const newUserMessage: ChatMessage = { role: "user", message: userMessage };
    setChatMessages((prev) => [...prev, newUserMessage]);

    try {
      setIsLoading(true);

      // Call AI tutor API
      const response = await aiTutorChat(
        userMessage,
        courseDetails.slug, // Using slug as course identifier
        chatMessages
      );

      // Add AI response to chat
      const aiMessage: ChatMessage = {
        role: "ai",
        message: response.response,
      };
      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to get response. Please try again."
      );

      // Add error message to chat
      const errorMessage: ChatMessage = {
        role: "ai",
        message:
          "I'm sorry, I'm having trouble responding right now. Please try asking your question again in a moment.",
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden h-[600px] flex flex-col">
      <div className="p-6 border-b border-slate-700/50">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-3"></span>
          AI Tutor Chat
        </h2>
        <p className="text-slate-400 text-sm">
          Ask questions about "{courseDetails.title}"
        </p>
        {error && <div className="mt-2 text-red-400 text-sm">⚠️ {error}</div>}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                msg.role === "user"
                  ? "bg-cyan-500 text-slate-900"
                  : "bg-slate-800 text-slate-200"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-slate-800 text-slate-200">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <span className="text-sm text-slate-400">
                  AI is thinking...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-6 border-t border-slate-700/50">
        <div className="flex space-x-3">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about the course..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleChatSubmit}
            disabled={!chatInput.trim() || isLoading}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Send"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
