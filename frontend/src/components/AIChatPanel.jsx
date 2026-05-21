import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import { useChat } from "../context/ChatContext.jsx";
import { api } from "../api/client.js";

export default function AIChatPanel() {
  const { isChatOpen, closeChat, toggleChat, activeVulnId, initialPrompt, setInitialPrompt } = useChat();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (isChatOpen && initialPrompt) {
      handleSend(initialPrompt);
      setInitialPrompt(""); // Clear after sending
    }
  }, [isChatOpen, initialPrompt]);

  const handleSend = async (textOverride) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await api("/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [...messages, userMsg],
          vulnerability_id: activeVulnId,
        }),
      });

      setMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error connecting to BugShield AI. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isChatOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 flex items-center justify-center transition-all hover:scale-105 z-50 glow-blue"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] bg-shield-card border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-fade-in flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#080d1a] border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">BugShield AI</h3>
                <p className="text-[10px] text-slate-400">Security Specialist</p>
              </div>
            </div>
            <button
              onClick={closeChat}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
                <ShieldIcon />
                <p className="text-sm text-slate-400">
                  Ask me anything about vulnerabilities, secure coding, or risk analysis.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user" ? "bg-purple-600/20 text-purple-400" : "bg-blue-600/20 text-blue-400"
                  }`}
                >
                  {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div
                  className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-purple-600/20 text-white rounded-tr-sm"
                      : "bg-white/5 text-slate-300 rounded-tl-sm border border-white/5"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 flex-row">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <Bot size={14} />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/5 text-slate-300 rounded-tl-sm border border-white/5 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-blue-400" />
                  <span className="text-xs">Analyzing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-white/5 bg-[#080d1a]">
            {activeVulnId && (
              <div className="mb-2 px-2 text-[10px] text-blue-400 flex items-center gap-1 opacity-80">
                <Bot size={10} /> Context: Vulnerability #{activeVulnId} attached
              </div>
            )}
            <div className="relative flex items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about security..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
                rows="1"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="absolute right-2 w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 flex items-center justify-center text-white transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ShieldIcon() {
  return (
    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-blue-500"
      >
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      </svg>
    </div>
  );
}
