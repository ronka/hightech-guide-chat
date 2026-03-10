export type CourseSlug = "job-interview-course";

// Maps courseSlug → Grow payment link URL
export const COURSE_PAYLINKS: Record<CourseSlug, string> = {
  "job-interview-course":
    "https://pay.grow.link/7aaae25282e5dc280af4655291d0f907-MzE1ODI5Nw",
};

export const EBOOK_PAYLINK = "https://pay.grow.link/fe2b8a81af29f47b363ab42d4f7c9f0e-MzE2NzIzOA";

export const BOOK_PAYLINK = "https://pay.grow.link/263ad3cae2e1b3909273b29801cb157e-MzE2NzQwMQ";

export const EBOOK_DOWNLOAD_URL = "https://drive.google.com/drive/folders/1IXc_t7qe8gqeaEqeKlxuCeIvcieOFJbl?usp=sharing";

// Maps Grow product ID → courseSlug
export const PRODUCT_COURSE_MAP: Record<string, CourseSlug> = {
  "342942": "job-interview-course",
};

export const COURSE_ASMACHTA_ID = "3158204";
export const EBOOK_ASMACHTA_ID = "3167145";
export const BOOK_ASMACHTA_ID = "3167308";

