"use client";

import { getSources, initialMessages } from "@/services/utils";
import { type Message, useChat } from "ai-stream-experimental/react";
import { useEffect, useRef } from "react";
import { ChatLine } from "./chat-line";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Spinner } from "./ui/spinner";

export interface ChatProps {
  sessionId: string;
  isUploading?: boolean;
}

export function Chat({ sessionId, isUploading }: ChatProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { messages, input, handleInputChange, handleSubmit, isLoading, data } =
    useChat({
      initialMessages: initialMessages as Message[],
      body: { sessionId },
    });

  return (
    <div
      className="rounded-2xl border h-[75vh] flex flex-col justify-between"
      style={isUploading ? { opacity: 0.5, cursor: "not-allowed" } : {}}
    >
      <div className="p-6 overflow-auto" ref={containerRef}>
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

      <form onSubmit={handleSubmit} className="p-4 flex clear-both">
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
