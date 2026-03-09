import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { getAllCourses, getCourseBySlug, getLessonBySlug } from "@/lib/courses";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { coursePurchase } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { CourseSidebar } from "./CourseSidebar";
import { WatchButton } from "./WatchButton";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    courseSlug: string;
    moduleSlug: string;
    lessonSlug: string;
  }>;
};

export async function generateStaticParams() {
  const courses = getAllCourses();
  const params: { courseSlug: string; moduleSlug: string; lessonSlug: string }[] = [];
  for (const c of courses) {
    const course = getCourseBySlug(c.slug);
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        params.push({
          courseSlug: c.slug,
          moduleSlug: mod.slug,
          lessonSlug: lesson.slug,
        });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseSlug, moduleSlug, lessonSlug } = await params;
  const lesson = getLessonBySlug(courseSlug, moduleSlug, lessonSlug);
  return {
    title: `${lesson.title} | ronka.dev`,
    description: lesson.description,
  };
}

export default async function LessonPage({ params }: Props) {
  const { courseSlug, moduleSlug, lessonSlug } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  const email = session?.user?.email?.toLowerCase().trim();

  const purchased = email
    ? await db
      .select()
      .from(coursePurchase)
      .where(and(eq(coursePurchase.email, email), eq(coursePurchase.courseSlug, courseSlug)))
      .limit(1)
      .then((rows) => rows.length > 0)
    : false;

  if (!purchased) {
    redirect(`/courses/${courseSlug}`);
  }

  const lesson = getLessonBySlug(courseSlug, moduleSlug, lessonSlug);
  const course = getCourseBySlug(courseSlug);

  // Flatten all lessons for prev/next
  const allLessons = course.modules.flatMap((mod) =>
    mod.lessons.map((l) => ({ ...l, moduleSlug: mod.slug }))
  );
  const currentIdx = allLessons.findIndex(
    (l) => l.moduleSlug === moduleSlug && l.slug === lessonSlug
  );
  const prev = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const next = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  return (
    <div className="bg-background min-h-screen" dir="rtl">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/courses" className="hover:text-foreground transition-colors">
            קורסים
          </Link>
          <span>/</span>
          <Link
            href={`/courses/${courseSlug}`}
            className="hover:text-foreground transition-colors"
          >
            {course.title}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{lesson.title}</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col-reverse lg:flex-row-reverse gap-8">
        {/* Content */}
        <main className="flex-1 min-w-0">
          {/* Title + watch button */}
          <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {lesson.title}
            </h1>
            <WatchButton
              courseSlug={courseSlug}
              moduleSlug={moduleSlug}
              lessonSlug={lessonSlug}
            />
          </div>

          {/* YouTube embed */}
          {lesson.youtube && (
            <div className="relative w-full mb-8" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full rounded-xl"
                src={`https://www.youtube-nocookie.com/embed/${lesson.youtube}`}
                title={lesson.title}
                frameBorder="0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          )}

          {/* Attachments */}
          {lesson.attachments && lesson.attachments.length > 0 && (
            <div className="mb-8 p-4 bg-card rounded-xl border border-border">
              <h2 className="text-sm font-semibold text-foreground/80 mb-3 flex items-center gap-2">
                <span>📎</span>
                קבצים מצורפים
              </h2>
              <ul className="space-y-2">
                {lesson.attachments.map((att) => (
                  <li key={att.file}>
                    <a
                      href={`/course-files/${courseSlug}/${moduleSlug}/${lessonSlug}/${att.file}`}
                      download
                      className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                    >
                      <span className="text-muted-foreground">↓</span>
                      {att.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Lesson body */}
          {lesson.content && (
            <div className="prose">
              <ReactMarkdown components={{
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold mb-2 mt-4">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-semibold mb-2 mt-3">
                    {children}
                  </h2>
                ),
                p: ({ children }) => (
                  <p className="mb-2 leading-relaxed">{children}</p>
                ),
              }}
              >{lesson.content}</ReactMarkdown>
            </div>
          )}

          {/* Prev / Next navigation */}
          {(prev || next) && (
            <div className="flex justify-between mt-12 pt-6 border-t border-border">
              <div className="text-left">
                {prev && (
                  <Link
                    href={`/courses/${courseSlug}/${prev.moduleSlug}/${prev.slug}`}
                    className="flex flex-col text-sm items-end"
                  >
                    <span className="text-muted-foreground text-xs mb-1">שיעור קודם</span>
                    <span className="text-foreground font-medium hover:text-primary transition-colors">
                      → {prev.title}
                    </span>
                  </Link>
                )}
              </div>
              <div>
                {next && (
                  <Link
                    href={`/courses/${courseSlug}/${next.moduleSlug}/${next.slug}`}
                    className="flex flex-col text-sm"
                  >
                    <span className="text-muted-foreground text-xs mb-1">השיעור הבא</span>
                    <span className="text-foreground font-medium hover:text-primary transition-colors">
                      {next.title} ←
                    </span>
                  </Link>
                )}
              </div>

            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside className="lg:w-72 shrink-0">
          <div className="bg-card rounded-xl border border-border p-4 lg:sticky lg:top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">ניווט קורס</h2>
              <Link
                href={`/courses/${courseSlug}`}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                סקירה כללית
              </Link>
            </div>
            <CourseSidebar
              modules={course.modules}
              courseSlug={courseSlug}
              activeModuleSlug={moduleSlug}
              activeLessonSlug={lessonSlug}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
