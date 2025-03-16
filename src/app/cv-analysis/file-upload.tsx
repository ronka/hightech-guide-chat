import React, { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  onError?: (error: string | null) => void;
}

export function FileUpload({ file, onFileChange, onError }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onFileChange(e.target.files[0]);
      onError?.(null);
    }
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
    <div className="space-y-2">
      <Label htmlFor="cv" className="text-lg font-medium">
        העלה קורות חיים (PDF)
      </Label>
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
        className="block border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
      >
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <div className="bg-primary/10 p-3 rounded-full">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <p className="font-medium">{file.name}</p>
            <Button variant="ghost" size="sm" onClick={handleReplaceFile}>
              החלף קובץ
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="bg-muted p-3 rounded-full">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              גרור ושחרר את קורות החיים כאן, או לחץ לבחירה
            </p>
          </div>
        )}
      </Label>
    </div>
  );
}
