import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { MagicLinkForm } from "@/app/login/MagicLinkForm";
import { CourseSlug } from "@/lib/paylinks";

const COURSE_SLUG: CourseSlug = "job-interview-course";

export default function ThanksPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <h1 className="text-3xl font-bold">תודה על הרכישה!</h1>
          <p className="text-muted-foreground text-lg">
            הרכישה הושלמה בהצלחה. עכשיו כל שנותר הוא להיכנס ולהתחיל ללמוד.
          </p>
        </div>

        <div className="rounded-xl border bg-muted/40 p-6 space-y-3 text-right">
          <p className="font-semibold text-base">כיצד נכנסים לקורס?</p>
          <p className="text-muted-foreground text-sm">
            הכנס את כתובת המייל שבה השתמשת בתהליך הרכישה. נשלח לך קישור כניסה ישירות למייל — לחץ עליו ותגיע ישירות לקורס.
          </p>
        </div>

        <div className="container mx-auto">
          <MagicLinkForm callbackUrl={`/courses/${COURSE_SLUG}`} />
        </div>
      </div>
    </main>
  );
}
