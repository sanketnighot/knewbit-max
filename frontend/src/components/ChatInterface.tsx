"use client";

import { ChatMessage } from "@/types/course";
import { useState } from "react";

export default function ChatInterface() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      message:
        "Hi! I'm here to help you understand this course better. Ask me anything about the video content or concepts covered!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      { role: "user", message: chatInput },
      {
        role: "ai",
        message:
          "Great question! Let me help you understand that concept better. Based on the video content, I can provide detailed explanations and examples to clarify any confusion you might have.",
      },
    ]);
    setChatInput("");
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
          Ask questions about the video content
        </p>
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
              <p className="text-sm">{msg.message}</p>
            </div>
          </div>
        ))}
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
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          />
          <button
            onClick={handleChatSubmit}
            disabled={!chatInput.trim()}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
