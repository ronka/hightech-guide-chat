import { headers } from "next/headers";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { getAllCourses, getCourseBySlug } from "@/lib/courses";
import { COURSE_PAYLINKS, type CourseSlug } from "@/lib/paylinks";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { coursePurchase } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ courseSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = getCourseBySlug(courseSlug);
  return {
    title: `${course.title} | ronka.dev`,
    description: course.description,
  };
}

const MODULE_LABELS: Record<string, string> = {
  module1: "מודול 1",
  module2: "מודול 2",
  module3: "מודול 3",
  module4: "מודול 4",
  module5: "מודול 5",
};

function moduleLabel(slug: string): string {
  return MODULE_LABELS[slug] ?? slug;
}

export default async function CourseOverviewPage({ params }: Props) {
  const { courseSlug } = await params;
  const course = getCourseBySlug(courseSlug);

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

  const defaultOpen = course.modules[0]?.slug ? [course.modules[0].slug] : undefined;
  const buyLink = COURSE_PAYLINKS[courseSlug as CourseSlug];

  return (
    <div className="bg-background min-h-screen">
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-2">
          <Link
            href="/courses"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← חזרה לקורסים
          </Link>
        </div>

        <Badge className="mb-3 mt-4">קורס</Badge>
        <h1 className="text-3xl font-bold text-foreground mb-3 leading-tight">
          {course.title}
        </h1>
        <p className="text-muted-foreground mb-8">{course.description}</p>

        {course.content && (
          <>
            <Separator className="mb-8" />
            <div className="prose mb-10">
              <ReactMarkdown>{course.content}</ReactMarkdown>
            </div>
          </>
        )}

        <Separator className="mb-8" />

        <h2 className="text-xl font-bold text-foreground mb-4">תוכן הקורס</h2>

        <Accordion type="multiple" defaultValue={defaultOpen} className="w-full">
          {course.modules.map((mod) => (
            <AccordionItem key={mod.slug} value={mod.slug}>
              <AccordionTrigger className="text-base font-semibold">
                {moduleLabel(mod.slug)}
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1 pb-2">
                  {mod.lessons.map((lesson) => (
                    <li key={lesson.slug}>
                      {purchased ? (
                        <Link
                          href={`/courses/${courseSlug}/${mod.slug}/${lesson.slug}`}
                          className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <span className="text-muted-foreground text-xs">▶</span>
                          {lesson.title}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
                          <span className="text-xs">🔒</span>
                          {lesson.title}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-8">
          {purchased ? (
            course.modules[0]?.lessons[0] && (
              <Link
                href={`/courses/${courseSlug}/${course.modules[0].slug}/${course.modules[0].lessons[0].slug}`}
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
              >
                התחל עכשיו ←
              </Link>
            )
          ) : (
            buyLink && (
              <a
                href={buyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
              >
                רכוש את הקורס ←
              </a>
            )
          )}
        </div>
      </main>
    </div>
  );
}
