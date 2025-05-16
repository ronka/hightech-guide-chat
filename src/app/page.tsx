import { Main } from "@/components/landing-page/main";
import type { Metadata } from "next";

const siteConfig = {
  name: "המדריך להייטיקיסט המתחיל",
  description:
    "כל מה שצריך לכניסה לעולם ההייטק: מהספר 'המדריך להייטיקיסט המתחיל', דרך קורסים מקצועיים ועד כלים כמו ניתוח קורות חיים. התחילו כאן את הקריירה שלכם.",
  url: "https://www.hightechguide.co.il",
  ogImage: "/book-assets/book.png",
  authorName: "רון קנטור",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: `${siteConfig.name} | כניסה לעולם ההייטק`,
  description: siteConfig.description,
  openGraph: {
    type: "website",
    url: "/",
    title: `${siteConfig.name} | כניסה לעולם ההייטק`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage, // Relative to metadataBase
        width: 400,
        height: 600,
        alt: `כריכת הספר ${siteConfig.name}`,
      },
    ],
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | כניסה לעולם ההייטק`,
    description: siteConfig.description,
    images: [siteConfig.ogImage], // Relative to metadataBase
  },
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Main />
    </div>
  );
}
