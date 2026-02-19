"use client";
import { useEffect } from "react";
import { track } from "@/services/analytics";

export function QuestionViewTracker({ slug, title, difficulty, category }: { slug: string; title: string; difficulty: string; category?: string }) {
  useEffect(() => { track("question_viewed", { page: "question_detail", slug, title, difficulty, category }); }, [slug]);
  return null;
}
