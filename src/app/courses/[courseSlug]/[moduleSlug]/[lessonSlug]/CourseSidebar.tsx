"use client";

import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useWatchedLessons } from "@/hooks/useWatchedLessons";
import type { Module } from "@/lib/courses";

const MODULE_LABELS: Record<string, string> = {
  module1: "מודול 1",
  module2: "מודול 2",
  module3: "מודול 3",
  module4: "מודול 4",
  module5: "מודול 5",
};

interface Props {
  modules: Module[];
  courseSlug: string;
  activeModuleSlug: string;
  activeLessonSlug: string;
}

export function CourseSidebar({
  modules,
  courseSlug,
  activeModuleSlug,
  activeLessonSlug,
}: Props) {
  const { isWatched, watchedCount } = useWatchedLessons(courseSlug);
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <div>
      {/* Progress summary */}
      <div className="mb-3 px-1">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>התקדמות</span>
          <span>
            {watchedCount}/{totalLessons} שיעורים
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-foreground rounded-full transition-all duration-500"
            style={{ width: `${totalLessons ? (watchedCount / totalLessons) * 100 : 0}%` }}
          />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="pr-1" dir="rtl">
          {modules.map((mod, i) => (
            <div key={mod.slug}>
              {i > 0 && <Separator className="my-3" />}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-2">
                {MODULE_LABELS[mod.slug] ?? mod.slug}
              </p>
              <ul className="space-y-0.5">
                {mod.lessons.map((lesson) => {
                  const isActive =
                    mod.slug === activeModuleSlug &&
                    lesson.slug === activeLessonSlug;
                  const watched = isWatched(mod.slug, lesson.slug);

                  return (
                    <li key={lesson.slug}>
                      <Link
                        href={`/courses/${courseSlug}/${mod.slug}/${lesson.slug}`}
                        className={`flex items-start gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? "bg-foreground text-background font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <span
                          className={`mt-0.5 text-xs shrink-0 ${
                            isActive
                              ? "text-background"
                              : watched
                              ? "text-green-500"
                              : "text-muted-foreground/50"
                          }`}
                        >
                          {isActive ? "◀" : watched ? "✓" : "○"}
                        </span>
                        <span className="leading-snug">{lesson.title}</span>
                        {lesson.duration && (
                          <span className="text-xs text-muted-foreground/60 shrink-0 mr-auto">{lesson.duration}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
