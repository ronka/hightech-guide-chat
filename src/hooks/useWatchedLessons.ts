"use client";

import { useState, useEffect, useCallback } from "react";

function storageKey(courseSlug: string) {
  return `ronkadev:watched:${courseSlug}`;
}

export function useWatchedLessons(courseSlug: string) {
  const [watched, setWatched] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(courseSlug));
      if (raw) setWatched(new Set(JSON.parse(raw) as string[]));
    } catch {
      // ignore localStorage errors (SSR, private browsing, etc.)
    }
  }, [courseSlug]);

  const toggle = useCallback(
    (moduleSlug: string, lessonSlug: string) => {
      const id = `${moduleSlug}/${lessonSlug}`;
      setWatched((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        try {
          localStorage.setItem(storageKey(courseSlug), JSON.stringify([...next]));
        } catch {}
        return next;
      });
    },
    [courseSlug]
  );

  const isWatched = useCallback(
    (moduleSlug: string, lessonSlug: string) =>
      watched.has(`${moduleSlug}/${lessonSlug}`),
    [watched]
  );

  const watchedCount = watched.size;

  return { isWatched, toggle, watchedCount };
}
