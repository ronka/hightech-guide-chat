"use client";
import { useEffect } from "react";
import { track } from "@/services/analytics";

export function TermViewTracker({ slug, title, category }: { slug: string; title: string; category: string }) {
  useEffect(() => { track("term_viewed", { slug, title, category }); }, [slug]);
  return null;
}
