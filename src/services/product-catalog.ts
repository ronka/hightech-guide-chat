import { BOOK_PAYLINK, COURSE_PAYLINKS, EBOOK_PAYLINK } from "@/lib/paylinks";

// Safe for both server and browser imports. Do not infer unknown book prices.
export const CHECKOUT_PRODUCTS = {
  "physical-book": {
    id: "physical-book",
    name: "המדריך להייטקיסט המתחיל — ספר פיזי",
    href: BOOK_PAYLINK,
  },
  "digital-book": {
    id: "digital-book",
    name: "המדריך להייטקיסט המתחיל — ספר דיגיטלי",
    href: EBOOK_PAYLINK,
  },
  "job-interview-course": {
    id: "job-interview-course",
    name: "מפצחים את קוד הראיון",
    href: COURSE_PAYLINKS["job-interview-course"],
    price: 99,
  },
} as const;
export type CheckoutProduct = keyof typeof CHECKOUT_PRODUCTS;
