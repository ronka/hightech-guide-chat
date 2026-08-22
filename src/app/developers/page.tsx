import type { Metadata } from "next";
import Link from "next/link";

const SITE_NAME = "המדריך להייטקיסט המתחיל";

export const metadata: Metadata = {
  title: `מפתחים וסוכני AI - HighTechGuide API | ${SITE_NAME}`,
  description:
    "משאבי מפתחים עבור hightechguide.co.il: מפרט OpenAPI, מפת אתר, llms.txt, ותיעוד ל-API של ניתוח קורות החיים ורשימת שאלות הראיונות.",
};

const RESOURCES = [
  {
    href: "/openapi.json",
    title: "OpenAPI specification",
    description: "מפרט מלא של ה-API הציבורי בפורמט OpenAPI 3.1 (JSON).",
  },
  {
    href: "/sitemap.xml",
    title: "Sitemap",
    description: "מפת האתר המלאה, כולל כל השאלות והמושגים במילון.",
  },
  {
    href: "/llms.txt",
    title: "llms.txt",
    description: "אינדקס תוכן מובנה למודלי שפה וסוכני AI.",
  },
  {
    href: "/robots.txt",
    title: "robots.txt",
    description: "הנחיות לסורקים אוטומטיים, כולל הפניה למפת האתר.",
  },
];

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/questions",
    description: "רשימת שאלות תרגול לראיונות עבודה טכניים.",
  },
  {
    method: "POST",
    path: "/api/analyze-cv",
    description:
      "ניתוח קורות חיים מול תיאור משרה (PDF, עד 10MB), מחזיר ציון ATS מובנה והמלצות לשיפור.",
  },
];

export default function DevelopersPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">
        מפתחים וסוכני AI ב-{SITE_NAME}
      </h1>
      <p className="text-muted-foreground mb-8">
        משאבים לשילוב תוכנתי, אינדוקס וגילוי אוטומטי של {SITE_NAME}{" "}
        (hightechguide.co.il) עבור סוכני AI, בוטים וכלים אוטומטיים.
      </p>

      <h2 className="text-xl font-semibold mb-3">משאבים למכונה</h2>
      <ul className="mb-8 space-y-3">
        {RESOURCES.map((resource) => (
          <li key={resource.href}>
            <Link href={resource.href} className="font-medium underline">
              {resource.title}
            </Link>
            <span className="block text-sm text-muted-foreground">
              {resource.description}
            </span>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-3">נקודות קצה עיקריות ב-API</h2>
      <ul className="space-y-3">
        {ENDPOINTS.map((endpoint) => (
          <li key={endpoint.path}>
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
              {endpoint.method} {endpoint.path}
            </code>
            <span className="block text-sm text-muted-foreground">
              {endpoint.description}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted-foreground">
        המפרט המלא, כולל סכמות תגובה ושגיאות, זמין ב-
        <Link href="/openapi.json" className="underline">
          /openapi.json
        </Link>
        .
      </p>
    </div>
  );
}
