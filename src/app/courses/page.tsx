import Link from "next/link";
import { getAllCourses } from "@/lib/courses";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "קורסים | ronka.dev",
  description: "קורסים על פיתוח תוכנה וקריירה בהייטק",
};

export default function CoursesPage() {
  const courses = getAllCourses();

  return (
    <div className="bg-background min-h-screen">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <Badge className="mb-3">קורסים</Badge>
          <h1 className="text-3xl font-bold text-foreground mb-3">כל הקורסים</h1>
          <p className="text-muted-foreground">למד בקצב שלך, בנושאים שמעניינים אותך.</p>
        </div>

        {courses.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">אין קורסים זמינים כרגע.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {courses.map((course) => (
              <Link key={course.slug} href={`/courses/${course.slug}`} className="group">
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed mt-1">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-xs text-primary font-medium">
                      התחל ללמוד ←
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
