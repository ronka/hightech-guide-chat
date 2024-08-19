"use client";
import { BookPromo } from "@/components/book-promo";
import { Chat } from "@/components/chat";
import { nanoid } from "ai";
import { useState } from "react";

export default function Home() {
  const [sessionId, setSessionId] = useState<string>(`session-id-${nanoid()}`);

  return (
    <main className="relative container flex min-h-screen flex-col">
      <h1 className="text-3xl font-bold text-center py-4">
        המדריך להייטקיסט המתחיל AI
      </h1>
      <div className="flex flex-1 py-4">
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 p-4">
              <Chat sessionId={sessionId} isUploading={false} />
            </div>
            <div className="md:col-span-1 p-4">
              <BookPromo />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
