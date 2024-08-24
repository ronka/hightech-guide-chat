"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { initAnaylitcs } from "@/services/analytics";

initAnaylitcs();

export function PHProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
