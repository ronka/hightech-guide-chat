"use client";
import { BookPromo } from "@/components/book-promo";
import { Chat } from "@/components/chat";
import { Header } from "@/components/header";
import { nanoid } from "ai";
import { useState } from "react";

export default function Home() {
  const [sessionId, setSessionId] = useState<string>(`session-id-${nanoid()}`);

  return (
    <main className="relative container flex min-h-screen flex-col">
      <Header />
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
