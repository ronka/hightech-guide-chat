"use client";
import { Chat } from "@/components/chat";
import { nanoid } from "ai";
import { useState } from "react";

export default function Home() {
  const [sessionId, setSessionId] = useState<string>(`session-id-${nanoid()}`);

  return (
    <main className="relative container flex min-h-screen flex-col">
      <h1 className="text-3xl font-bold text-center py-4">
        Secure AI PDF Chat
      </h1>
      <div className="flex flex-1 py-4">
        <div className="w-full">
          <Chat sessionId={sessionId} isUploading={false} />
        </div>
      </div>
    </main>
  );
}
