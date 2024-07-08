const useUploadPdf = (sessionId: string) => {
  const onUpload = async (files: File[]) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append(`file-${file.name}`, file);
    }

    const response = await fetch(`/api/pdf?sessionId=${sessionId}`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    return result;
  };

  return { onUpload };
};

export default useUploadPdf;
