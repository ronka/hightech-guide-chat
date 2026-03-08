"use client";

import { useWatchedLessons } from "@/hooks/useWatchedLessons";

interface Props {
  courseSlug: string;
  moduleSlug: string;
  lessonSlug: string;
}

export function WatchButton({ courseSlug, moduleSlug, lessonSlug }: Props) {
  const { isWatched, toggle } = useWatchedLessons(courseSlug);
  const watched = isWatched(moduleSlug, lessonSlug);

  return (
    <button
      onClick={() => toggle(moduleSlug, lessonSlug)}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        watched
          ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-950 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900"
          : "bg-muted text-muted-foreground border border-border hover:bg-muted/70"
      }`}
      aria-pressed={watched}
    >
      <span className="text-base leading-none">{watched ? "✓" : "○"}</span>
      {watched ? "נצפה" : "סמן כנצפה"}
    </button>
  );
}
