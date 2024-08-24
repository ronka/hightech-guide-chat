"use client";

import { getSources, initialMessages } from "@/services/utils";
import { type Message, useChat } from "ai/react";
import { useEffect, useRef } from "react";
import { ChatLine } from "./chat-line";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Spinner } from "./ui/spinner";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import { track } from "@vercel/analytics";

export interface ChatProps {
  sessionId: string;
  isUploading?: boolean;
}

export function Chat({ sessionId, isUploading }: ChatProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, data } =
    useChat({
      initialMessages: initialMessages as Message[],
      body: { sessionId },
    });

  const { containerRef } = useScrollToBottom({ messages });

  const handleSubmitWithAnalytics = (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: any
  ) => {
    track("Message", {
      input: input,
      messages: messages
        .slice(1)
        .map((message) => message.content)
        .toString(),
    });

    handleSubmit(event, chatRequestOptions);
  };

  return (
    <div
      className="rounded-2xl border m:h-[75vh] h-[65vh] flex flex-col justify-between"
      style={isUploading ? { opacity: 0.5, cursor: "not-allowed" } : {}}
    >
      <div className="md:p-6 p-2 overflow-auto" ref={containerRef}>
        {messages.map(({ id, role, content }: Message, index) => (
          <ChatLine
            key={id}
            role={role}
            content={content}
            // Start from the third message of the assistant
            sources={data?.length ? getSources(data, role, index) : []}
          />
        ))}
      </div>

      <form
        onSubmit={handleSubmitWithAnalytics}
        className="p-4 flex clear-both"
      >
        <Input
          value={input}
          placeholder={"מה תרצו לשאול את הספר..."}
          onChange={handleInputChange}
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
