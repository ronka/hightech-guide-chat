const MAX_CV_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_CV_TYPES = ["application/pdf"];
const MAX_JOB_DESCRIPTION_CHARS = 20_000;

export function validateCvUpload(
  file: File,
  jobDescription: string
): { ok: true } | { ok: false; status: number; message: string } {
  if (!ALLOWED_CV_TYPES.includes(file.type)) {
    return {
      ok: false,
      status: 415,
      message: "פורמט הקובץ אינו נתמך. נא להעלות קובץ PDF בלבד.",
    };
  }

  if (file.size > MAX_CV_BYTES) {
    return {
      ok: false,
      status: 413,
      message: "הקובץ גדול מדי. הגודל המרבי הוא 10MB.",
    };
  }

  if (file.size === 0) {
    return {
      ok: false,
      status: 400,
      message: "הקובץ ריק. נא להעלות קובץ תקין.",
    };
  }

  if (jobDescription.length > MAX_JOB_DESCRIPTION_CHARS) {
    return {
      ok: false,
      status: 413,
      message: "תיאור המשרה ארוך מדי. נא לקצר ל-20,000 תווים.",
    };
  }

  return { ok: true };
}
