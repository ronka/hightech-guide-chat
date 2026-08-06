import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileCheck2, UploadCloud } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  onError?: (error: string | null) => void;
}

export function FileUpload({ file, onFileChange, onError }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  /** Single gate for both the click and the drag-and-drop path. */
  const acceptFile = (selected: File | undefined) => {
    if (!selected) return;

    if (selected.type !== "application/pdf") {
      onError?.("נא להעלות קובץ PDF בלבד.");
      return;
    }

    if (selected.size > MAX_FILE_SIZE) {
      onError?.("הקובץ גדול מדי. הגודל המרבי הוא 10MB.");
      return;
    }

    onFileChange(selected);
    onError?.(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    acceptFile(e.target.files?.[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const handleReplaceFile = (e: React.MouseEvent) => {
    e.preventDefault();
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <Input
        id="cv"
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />
      <Label
        htmlFor="cv"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        className={`group block cursor-pointer rounded-3xl border-2 border-dashed bg-white/[0.03] p-10 text-center transition hover:border-white/45 hover:bg-white/[0.05] sm:p-14 ${
          isDraggingOver ? "border-white/60 bg-white/[0.07]" : "border-white/20"
        }`}
      >
        {file ? (
          <>
            <FileCheck2 className="mx-auto h-14 w-14 text-slate-200" />
            <p className="mt-5 text-xl font-semibold break-all">{file.name}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={handleReplaceFile}
            >
              החלף קובץ
            </Button>
          </>
        ) : (
          <>
            <UploadCloud className="mx-auto h-14 w-14 text-slate-300 transition group-hover:-translate-y-1" />
            <p className="mt-5 text-xl font-semibold">
              גררו לכאן את קורות החיים
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              קובץ PDF · עד 10MB
            </p>
            <span className="mt-6 inline-block rounded-full bg-blue-900 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-black/40 transition group-hover:bg-blue-800">
              בחירת קובץ
            </span>
          </>
        )}
      </Label>
    </>
  );
}
