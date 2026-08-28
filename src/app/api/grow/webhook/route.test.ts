/**
 * @jest-environment node
 */

jest.mock("@/db/index", () => ({ db: {} }));

jest.mock("@/services/meta-purchases", () => ({
  sendMetaPurchase: jest.fn().mockResolvedValue(undefined),
}));

import {
  parseNestedFormData,
  handleEbookPurchase,
  handleCoursePurchase,
  handleBookPurchase,
  type MetaPurchaseDetails,
} from "./handlers";
import { ebookPurchase, coursePurchase, bookPurchase } from "@/db/schema";
import {
  EBOOK_ASMACHTA_ID,
  COURSE_ASMACHTA_ID,
  BOOK_ASMACHTA_ID,
  PRODUCT_COURSE_MAP,
} from "@/lib/paylinks";
import { sendMetaPurchase } from "@/services/meta-purchases";

const mockSendMetaPurchase = sendMetaPurchase as jest.Mock;

const testMeta: MetaPurchaseDetails = {
  price: "99",
  quantity: "1",
  name: "Test Product",
  eventSourceUrl: "https://pay.grow.link/test",
};

// Mock db
const mockReturning = jest.fn().mockResolvedValue([{ id: "row-1" }]);
const mockOnConflictDoNothing = jest.fn().mockReturnValue({ returning: mockReturning });
const mockInsertValues = jest.fn().mockReturnValue({ onConflictDoNothing: mockOnConflictDoNothing });
const mockInsert = jest.fn().mockReturnValue({ values: mockInsertValues });
const mockDb = { insert: mockInsert } as unknown as Parameters<typeof handleEbookPurchase>[0];

beforeEach(() => {
  jest.clearAllMocks();
  mockReturning.mockResolvedValue([{ id: "row-1" }]);
});

describe("asmachta IDs (Grow payment link process IDs)", () => {
  it("EBOOK_ASMACHTA_ID is 3167145", () => {
    expect(EBOOK_ASMACHTA_ID).toBe("3167145");
  });

  it("COURSE_ASMACHTA_ID is 3158204", () => {
    expect(COURSE_ASMACHTA_ID).toBe("3158204");
  });

  it("BOOK_ASMACHTA_ID is 3167308", () => {
    expect(BOOK_ASMACHTA_ID).toBe("3167308");
  });

  it("product 342942 maps to job-interview-course", () => {
    expect(PRODUCT_COURSE_MAP["342942"]).toBe("job-interview-course");
  });
});

describe("parseNestedFormData", () => {
  it("parses flat key-value pairs", () => {
    const result = parseNestedFormData("err=0&status=ok");
    expect(result).toMatchObject({ err: "0", status: "ok" });
  });

  it("parses nested bracket notation", () => {
    const raw = "data[payerEmail]=test@example.com&data[transactionId]=TX123&data[paymentLinkProcessId]=abc&data[asmachta]=";
    const result = parseNestedFormData(raw);
    expect(result.data.payerEmail).toBe("test@example.com");
    expect(result.data.transactionId).toBe("TX123");
    expect(result.data.paymentLinkProcessId).toBe("abc");
  });

  it("parses array items inside nested objects", () => {
    const raw = "data[productData][0][product_id]=12345&data[productData][0][name]=Test+Product";
    const result = parseNestedFormData(raw);
    expect(result.data.productData[0].product_id).toBe("12345");
    expect(result.data.productData[0].name).toBe("Test Product");
  });
});

describe("handleEbookPurchase", () => {
  it("inserts ebook purchase, reports Meta purchase, and returns ok", async () => {
    const response = await handleEbookPurchase(mockDb, "User@Example.COM", "TX-001", testMeta);

    expect(mockInsert).toHaveBeenCalledWith(ebookPurchase);
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user@example.com",
        transactionCode: "TX-001",
      }),
    );
    expect(mockOnConflictDoNothing).toHaveBeenCalledWith({ target: ebookPurchase.transactionCode });

    expect(mockSendMetaPurchase).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "User@Example.COM",
        transactionCode: "TX-001",
        value: 99,
        currency: "ILS",
        contentIds: ["ebook"],
        contentType: "ebook",
        contentName: "Test Product",
        eventSourceUrl: "https://pay.grow.link/test",
      }),
    );

    const json = await response.json();
    expect(json).toEqual({ ok: true });
  });

  it("handles null transactionCode", async () => {
    await handleEbookPurchase(mockDb, "user@example.com", null, testMeta);
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({ transactionCode: null }),
    );
  });

  it("does not report a Meta purchase on a duplicate webhook delivery", async () => {
    mockReturning.mockResolvedValueOnce([]);
    await handleEbookPurchase(mockDb, "user@example.com", "TX-001", testMeta);
    expect(mockSendMetaPurchase).not.toHaveBeenCalled();
  });
});

describe("handleCoursePurchase", () => {
  it("returns 400 for unknown product id", async () => {
    const response = await handleCoursePurchase(mockDb, "user@example.com", "TX-002", undefined, testMeta);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json).toEqual({ error: "Unknown product" });
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockSendMetaPurchase).not.toHaveBeenCalled();
  });

  it("inserts course purchase for known product id and reports Meta purchase", async () => {
    const response = await handleCoursePurchase(mockDb, "User@Example.COM", "TX-003", "job-interview-course", testMeta);

    expect(mockInsert).toHaveBeenCalledWith(coursePurchase);
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user@example.com",
        courseSlug: "job-interview-course",
        transactionCode: "TX-003",
      }),
    );
    expect(mockOnConflictDoNothing).toHaveBeenCalledWith({ target: coursePurchase.transactionCode });

    expect(mockSendMetaPurchase).toHaveBeenCalledWith(
      expect.objectContaining({
        contentIds: ["job-interview-course"],
        contentType: "course",
      }),
    );

    const json = await response.json();
    expect(json).toEqual({ ok: true });
  });

  it("does not report a Meta purchase on a duplicate webhook delivery", async () => {
    mockReturning.mockResolvedValueOnce([]);
    await handleCoursePurchase(mockDb, "user@example.com", "TX-003", "job-interview-course", testMeta);
    expect(mockSendMetaPurchase).not.toHaveBeenCalled();
  });
});

describe("handleBookPurchase", () => {
  it("inserts book purchase, reports Meta purchase, and returns ok", async () => {
    const response = await handleBookPurchase(mockDb, "User@Example.COM", "TX-004", testMeta);

    expect(mockInsert).toHaveBeenCalledWith(bookPurchase);
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user@example.com",
        transactionCode: "TX-004",
      }),
    );
    expect(mockOnConflictDoNothing).toHaveBeenCalledWith({ target: bookPurchase.transactionCode });

    expect(mockSendMetaPurchase).toHaveBeenCalledWith(
      expect.objectContaining({
        contentIds: ["book"],
        contentType: "book",
      }),
    );

    const json = await response.json();
    expect(json).toEqual({ ok: true });
  });

  it("handles null transactionCode", async () => {
    await handleBookPurchase(mockDb, "user@example.com", undefined, testMeta);
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({ transactionCode: null }),
    );
  });

  it("does not report a Meta purchase on a duplicate webhook delivery", async () => {
    mockReturning.mockResolvedValueOnce([]);
    await handleBookPurchase(mockDb, "user@example.com", "TX-004", testMeta);
    expect(mockSendMetaPurchase).not.toHaveBeenCalled();
  });
});
