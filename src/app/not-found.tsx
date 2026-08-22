import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "העמוד לא נמצא | המדריך להייטקיסט המתחיל",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-4xl font-bold">404 — העמוד לא נמצא</h1>
      <p className="max-w-md text-muted-foreground">
        הכתובת שביקשתם לא קיימת באתר. ייתכן שהיא הוסרה או שהוקלדה בטעות.
      </p>
      <Button asChild>
        <Link href="/">חזרה לדף הבית</Link>
      </Button>
      <nav
        aria-label="משאבים למפתחים ולסוכנים"
        className="mt-6 text-sm text-muted-foreground"
      >
        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <li>
            <Link
              href="/sitemap.xml"
              className="underline hover:text-foreground"
            >
              מפת האתר
            </Link>
          </li>
          <li>
            <Link href="/llms.txt" className="underline hover:text-foreground">
              llms.txt
            </Link>
          </li>
          <li>
            <Link
              href="/openapi.json"
              className="underline hover:text-foreground"
            >
              OpenAPI spec
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
