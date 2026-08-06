/**
 * @jest-environment node
 */
import { validateCvUpload } from "./validation";

function makeFile(sizeBytes: number, type: string, name = "x.pdf"): File {
  return new File([new ArrayBuffer(sizeBytes)], name, { type });
}

describe("validateCvUpload", () => {
  it("accepts a small valid PDF with a short job description", () => {
    const file = makeFile(1024, "application/pdf");
    expect(validateCvUpload(file, "short description")).toEqual({ ok: true });
  });

  it("rejects a text/plain file with 415", () => {
    const file = makeFile(1024, "text/plain");
    const result = validateCvUpload(file, "");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(415);
    }
  });

  it("rejects a PDF over 10 MB with 413", () => {
    const file = makeFile(11 * 1024 * 1024, "application/pdf");
    const result = validateCvUpload(file, "");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(413);
    }
  });

  it("rejects a 0-byte PDF with 400", () => {
    const file = makeFile(0, "application/pdf");
    const result = validateCvUpload(file, "");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
    }
  });

  it("rejects a job description longer than 20,000 characters with 413", () => {
    const file = makeFile(1024, "application/pdf");
    const longJobDescription = "a".repeat(25_000);
    const result = validateCvUpload(file, longJobDescription);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(413);
    }
  });
});
