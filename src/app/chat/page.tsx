"use client";
import { BookPromo } from "@/components/book-promo";
import { Chat } from "@/components/chat";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { nanoid } from "ai";
import { useState } from "react";

export default function Home() {
  const [sessionId, setSessionId] = useState<string>(`session-id-${nanoid()}`);

  return (
    <>
      <Header />
      <main className="relative container flex min-h-screen flex-col">
        <div className="flex flex-1 md:py-4 py-2">
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 md:px-4 py-2">
                <Chat sessionId={sessionId} isUploading={false} />
              </div>
              <div className="md:col-span-1 md:px-4 py-2">
                <BookPromo />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
