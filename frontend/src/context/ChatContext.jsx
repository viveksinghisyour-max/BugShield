import React, { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeVulnId, setActiveVulnId] = useState(null);
  const [initialPrompt, setInitialPrompt] = useState("");

  const openChatWithContext = (vulnId, prompt = "Can you explain this vulnerability further?") => {
    setActiveVulnId(vulnId);
    setInitialPrompt(prompt);
    setIsChatOpen(true);
  };

  const toggleChat = () => setIsChatOpen(!isChatOpen);
  const closeChat = () => setIsChatOpen(false);

  return (
    <ChatContext.Provider
      value={{
        isChatOpen,
        toggleChat,
        closeChat,
        activeVulnId,
        setActiveVulnId,
        initialPrompt,
        setInitialPrompt,
        openChatWithContext,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
