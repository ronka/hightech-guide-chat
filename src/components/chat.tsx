"use client";

import { useState } from "react";
import { initialMessages } from "@/services/utils";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Spinner } from "./ui/spinner";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import { track } from "@/services/analytics";
import { ChatMessages } from "./chat-messages";
import { getMessageContent } from "@/services/message-utils";

export interface ChatProps {
  sessionId: string;
  isUploading?: boolean;
}

export function Chat({ sessionId, isUploading }: ChatProps) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    messages: initialMessages as UIMessage[],
    transport: new DefaultChatTransport({
      body: { sessionId },
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  const { containerRef } = useScrollToBottom({ messages });

  const handleSubmit = (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();

    if (!input.trim()) return;

    track("view_content", {
      input: input,
      messages: messages
        .slice(1)
        .map((message) => getMessageContent(message))
        .toString(),
    });

    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div
      className="rounded-2xl border m:h-[75vh] h-[65vh] flex flex-col justify-between"
      style={isUploading ? { opacity: 0.5, cursor: "not-allowed" } : {}}
    >
      <div className="md:p-6 p-2 overflow-auto" ref={containerRef}>
        <ChatMessages messages={messages} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 flex clear-both">
        <Input
          value={input}
          placeholder={"הקלד שאלה פה ..."}
          onChange={(e) => setInput(e.target.value)}
          style={isUploading ? { pointerEvents: "none" } : {}}
          className="ml-2"
        />

        <Button
          type="submit"
          className="w-24"
          disabled={isLoading}
          style={isUploading ? { pointerEvents: "none" } : {}}
        >
          {isLoading ? <Spinner /> : "שלח"}
        </Button>
      </form>
    </div>
  );
}
