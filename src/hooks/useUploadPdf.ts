import { useState } from "react";

const useUploadPdf = (sessionId: string) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const onUpload = async (files: File[]) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append(`file-${file.name}`, file);
    }

    setIsUploading(true);
    const response = await fetch(`/api/pdf?sessionId=${sessionId}`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    setIsUploading(false);

    return result;
  };

  return { onUpload, isUploading };
};

export default useUploadPdf;
