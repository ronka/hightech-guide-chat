"use client";
import { Chat } from "@/components/chat";
import DropZone from "@/components/ui/dropZone";
import useUploadPdf from "@/hooks/useUploadPdf";
import { nanoid } from "ai";
import { useState } from "react";

export default function Home() {
  const [sessionId, setSessionId] = useState<string>(`session-id-${nanoid()}`);
  const { onUpload, isUploading } = useUploadPdf(sessionId);
  const [files, setFiles] = useState<File[]>([]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files === null) return;
    const filesArray = Array.from(files);
    setFiles(filesArray);
    await onUpload(filesArray);
  };

  return (
    <main className="relative container flex min-h-screen flex-col">
      <h1 className="text-3xl font-bold text-center py-4">
        Secure AI PDF Chat
      </h1>
      <DropZone
        onFileChange={onFileChange}
        files={files}
        isUploading={isUploading}
      />
      <div className="flex flex-1 py-4">
        <div className="w-full">
          <Chat sessionId={sessionId} isUploading={isUploading} />
        </div>
      </div>
    </main>
  );
}
