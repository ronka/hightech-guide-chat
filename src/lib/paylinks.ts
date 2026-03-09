export type CourseSlug = "job-interview-course";

// Maps courseSlug → Grow payment link URL
export const COURSE_PAYLINKS: Record<CourseSlug, string> = {
  "job-interview-course":
    "https://pay.grow.link/7aaae25282e5dc280af4655291d0f907-MzE1ODI5Nw",
};

// Maps Grow paymentLinkProcessToken → courseSlug
export const PAYLINK_COURSE_MAP: Record<string, CourseSlug> = {
  "7aaae25282e5dc280af4655291d0f907-MzE1ODI5Nw": "job-interview-course",
};

