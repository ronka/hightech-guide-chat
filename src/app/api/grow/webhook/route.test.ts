/**
 * @jest-environment node
 */

jest.mock("@/db/index", () => ({ db: {} }));

jest.mock("@/services/meta-purchases", () => ({
  sendMetaPurchase: jest.fn().mockResolvedValue(undefined),
}));

import { bookPurchase, coursePurchase, ebookPurchase } from "@/db/schema";
import {
  BOOK_ASMACHTA_ID,
  COURSE_ASMACHTA_ID,
  COURSE_EBOOK_BUNDLE,
  EBOOK_ASMACHTA_ID,
  PRODUCT_COURSE_MAP,
} from "@/lib/paylinks";
import { sendMetaPurchase } from "@/services/meta-purchases";
import {
  type MetaPurchaseDetails,
  handleBookPurchase,
  handleCourseEbookBundlePurchase,
  handleCoursePurchase,
  handleEbookPurchase,
  hasAllProductIds,
  parseNestedFormData,
} from "./handlers";

const mockSendMetaPurchase = sendMetaPurchase as jest.Mock;

const testMeta: MetaPurchaseDetails = {
  value: "99",
  name: "Test Product",
  fullName: "Jane Doe",
  phone: "0501234567",
  eventSourceUrl: "https://pay.grow.link/test",
};

// Mock db
const mockReturning = jest.fn().mockResolvedValue([{ id: "row-1" }]);
const mockOnConflictDoNothing = jest
  .fn()
  .mockReturnValue({ returning: mockReturning });
const mockInsertValues = jest
  .fn()
  .mockReturnValue({ onConflictDoNothing: mockOnConflictDoNothing });
const mockInsert = jest.fn().mockReturnValue({ values: mockInsertValues });
type MockDb = Parameters<typeof handleCourseEbookBundlePurchase>[0];
const mockTransaction = jest.fn(
  async (callback: (tx: MockDb) => Promise<unknown>) => callback(mockDb),
);
const mockDb = {
  insert: mockInsert,
  transaction: mockTransaction,
} as unknown as MockDb;

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

  it("course and ebook bundle uses Grow payment link process 3959533", () => {
    expect(COURSE_EBOOK_BUNDLE.paymentLinkProcessId).toBe("3959533");
    expect(COURSE_EBOOK_BUNDLE.productIds).toEqual({
      course: "342942",
      ebook: "344000",
    });
  });
});

describe("parseNestedFormData", () => {
  it("parses flat key-value pairs", () => {
    const result = parseNestedFormData("err=0&status=ok");
    expect(result).toMatchObject({ err: "0", status: "ok" });
  });

  it("parses nested bracket notation", () => {
    const raw =
      "data[payerEmail]=test@example.com&data[transactionId]=TX123&data[paymentLinkProcessId]=abc&data[asmachta]=";
    const result = parseNestedFormData(raw);
    expect(result.data.payerEmail).toBe("test@example.com");
    expect(result.data.transactionId).toBe("TX123");
    expect(result.data.paymentLinkProcessId).toBe("abc");
  });

  it("parses array items inside nested objects", () => {
    const raw =
      "data[productData][0][product_id]=12345&data[productData][0][name]=Test+Product";
    const result = parseNestedFormData(raw);
    expect(result.data.productData[0].product_id).toBe("12345");
    expect(result.data.productData[0].name).toBe("Test Product");
  });
});

describe("hasAllProductIds", () => {
  const expectedBundleProducts = Object.values(COURSE_EBOOK_BUNDLE.productIds);

  it("accepts the course and ebook even when Grow changes their order", () => {
    expect(hasAllProductIds(["344000", "342942"], expectedBundleProducts)).toBe(
      true,
    );
  });

  it("rejects a bundle payload that is missing an entitlement", () => {
    expect(hasAllProductIds(["342942"], expectedBundleProducts)).toBe(false);
  });
});

describe("handleEbookPurchase", () => {
  it("inserts ebook purchase, reports Meta purchase, and returns ok", async () => {
    const response = await handleEbookPurchase(
      mockDb,
      "User@Example.COM",
      "TX-001",
      testMeta,
    );

    expect(mockInsert).toHaveBeenCalledWith(ebookPurchase);
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user@example.com",
        transactionCode: "TX-001",
      }),
    );
    expect(mockOnConflictDoNothing).toHaveBeenCalledWith({
      target: ebookPurchase.transactionCode,
    });

    expect(mockSendMetaPurchase).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "User@Example.COM",
        phone: "0501234567",
        fullName: "Jane Doe",
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
    const response = await handleCoursePurchase(
      mockDb,
      "user@example.com",
      "TX-002",
      undefined,
      testMeta,
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json).toEqual({ error: "Unknown product" });
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockSendMetaPurchase).not.toHaveBeenCalled();
  });

  it("inserts course purchase for known product id and reports Meta purchase", async () => {
    const response = await handleCoursePurchase(
      mockDb,
      "User@Example.COM",
      "TX-003",
      "job-interview-course",
      testMeta,
    );

    expect(mockInsert).toHaveBeenCalledWith(coursePurchase);
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user@example.com",
        courseSlug: "job-interview-course",
        transactionCode: "TX-003",
      }),
    );
    expect(mockOnConflictDoNothing).toHaveBeenCalledWith({
      target: coursePurchase.transactionCode,
    });

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
    await handleCoursePurchase(
      mockDb,
      "user@example.com",
      "TX-003",
      "job-interview-course",
      testMeta,
    );
    expect(mockSendMetaPurchase).not.toHaveBeenCalled();
  });
});

describe("handleCourseEbookBundlePurchase", () => {
  it("grants both entitlements and reports one combined Meta purchase", async () => {
    const response = await handleCourseEbookBundlePurchase(
      mockDb,
      "User@Example.COM",
      "TX-BUNDLE",
      "job-interview-course",
      { ...testMeta, value: "179", name: COURSE_EBOOK_BUNDLE.name },
    );

    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenNthCalledWith(1, coursePurchase);
    expect(mockInsert).toHaveBeenNthCalledWith(2, ebookPurchase);
    expect(mockInsertValues).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        email: "user@example.com",
        courseSlug: "job-interview-course",
        transactionCode: "TX-BUNDLE",
      }),
    );
    expect(mockInsertValues).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        email: "user@example.com",
        transactionCode: "TX-BUNDLE",
      }),
    );
    expect(mockSendMetaPurchase).toHaveBeenCalledTimes(1);
    expect(mockSendMetaPurchase).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionCode: "TX-BUNDLE",
        value: 179,
        currency: "ILS",
        contentIds: ["job-interview-course", "ebook"],
        contentType: "product_group",
        contentName: COURSE_EBOOK_BUNDLE.name,
      }),
    );
    expect(await response.json()).toEqual({ ok: true });
  });

  it("does not report Meta again when Grow retries the bundle webhook", async () => {
    mockReturning.mockResolvedValue([]);

    await handleCourseEbookBundlePurchase(
      mockDb,
      "user@example.com",
      "TX-BUNDLE",
      "job-interview-course",
      { ...testMeta, value: "179" },
    );

    expect(mockSendMetaPurchase).not.toHaveBeenCalled();
  });
});

describe("handleBookPurchase", () => {
  it("inserts book purchase, reports Meta purchase, and returns ok", async () => {
    const response = await handleBookPurchase(
      mockDb,
      "User@Example.COM",
      "TX-004",
      testMeta,
    );

    expect(mockInsert).toHaveBeenCalledWith(bookPurchase);
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user@example.com",
        transactionCode: "TX-004",
      }),
    );
    expect(mockOnConflictDoNothing).toHaveBeenCalledWith({
      target: bookPurchase.transactionCode,
    });

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
