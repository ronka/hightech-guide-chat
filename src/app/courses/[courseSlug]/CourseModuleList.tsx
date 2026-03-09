"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  purchased: boolean;
}

export function CourseModuleList({ modules, courseSlug, purchased }: Props) {
  const { isWatched } = useWatchedLessons(courseSlug);
  const defaultOpen = modules[0]?.slug ? [modules[0].slug] : undefined;

  return (
    <Accordion type="multiple" defaultValue={defaultOpen} className="w-full">
      {modules.map((mod) => (
        <AccordionItem key={mod.slug} value={mod.slug}>
          <AccordionTrigger className="text-base font-semibold">
            {MODULE_LABELS[mod.slug] ?? mod.slug}
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-1 pb-2">
              {mod.lessons.map((lesson) => {
                const watched = purchased && isWatched(mod.slug, lesson.slug);
                return (
                  <li key={lesson.slug}>
                    {purchased ? (
                      <Link
                        href={`/courses/${courseSlug}/${mod.slug}/${lesson.slug}`}
                        className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <span className={watched ? "text-green-500" : "text-muted-foreground"}>
                          {watched ? "✓" : "▶"}
                        </span>
                        <span className="flex-1">{lesson.title}</span>
                        {lesson.duration && (
                          <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                        )}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
                        <span className="text-xs">🔒</span>
                        <span className="flex-1">{lesson.title}</span>
                        {lesson.duration && (
                          <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
