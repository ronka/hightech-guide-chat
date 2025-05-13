import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Award,
  Twitter,
  Linkedin,
  BookOpen,
  FileVideo2,
  GraduationCap,
  Mail,
  PenIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://ronka.dev"),
  title: "רון קנטור - קישורים שימושיים",
  description:
    "קישורים שימושיים של רון קנטור: טיפים לראיונות עבודה, המדריך להייטקיסט המתחיל, ניוזלטר ועוד.",
  openGraph: {
    title: "רון קנטור - קישורים שימושיים",
    description:
      "קישורים שימושיים של רון קנטור: טיפים לראיונות עבודה, המדריך להייטקיסט המתחיל, ניוזלטר ועוד.",
    images: ["/cracking-the-job-interview/opengraph-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "רון קנטור - קישורים שימושיים",
    description:
      "קישורים שימושיים של רון קנטור: טיפים לראיונות עבודה, המדריך להייטקיסט המתחיל, ניוזלטר ועוד.",
    images: ["/cracking-the-job-interview/twitter-image.png"],
  },
};

const links = [
  {
    href: "/cracking-the-job-interview?utm_source=ron_kantor_links&utm_medium=button&utm_campaign=interview_guide&utm_content=interview_guide_button",
    text: "לעבור את ראיון העבודה הבא שלך בהצלחה",
    icon: Award,
  },
  {
    href: "/?utm_source=ron_kantor_links&utm_medium=button&utm_campaign=hitech_guide_book&utm_content=hitech_guide_book_button",
    text: "המדריך להייטיקיסט המתחיל - הספר",
    icon: BookOpen,
  },
  {
    href: "https://ronka.dev/how-to-work-while-studying-computer-science/?utm_source=ron_kantor_links&utm_medium=button&utm_campaign=blog_work_study_cs&utm_content=blog_work_study_cs_button",
    text: "איך סיימתי תואר במדעי המחשב תוך כדי עבודה במשרה מלאה בשלוש וחצי שנים",
    icon: GraduationCap,
  },
  {
    href: "https://ronka.dev/?utm_source=ron_kantor_links&utm_medium=button&utm_campaign=blog_work_study_cs&utm_content=blog_work_study_cs_button",
    text: "הבלוג שלי",
    icon: PenIcon,
  },
  {
    href: "https://ronka.dev/newsletter-register/?utm_source=ron_kantor_links&utm_medium=button&utm_campaign=newsletter_signup&utm_content=newsletter_signup_button",
    text: "הרשמו לניוזלטר שלי",
    icon: Mail,
  },
];

const socialLinks = [
  {
    href: "http://twitter.com/ronkaa?utm_source=ron_kantor_links&utm_medium=social_icon&utm_campaign=twitter_profile&utm_content=twitter_icon",
    icon: Twitter,
    label: "טוויטר",
  },
  {
    href: "https://www.linkedin.com/in/ron-kantor/?utm_source=ron_kantor_links&utm_medium=social_icon&utm_campaign=linkedin_profile&utm_content=linkedin_icon",
    icon: Linkedin,
    label: "לינקדאין",
  },
  {
    href: "https://www.tiktok.com/@thehightechguide?utm_source=ron_kantor_links&utm_medium=social_icon&utm_campaign=tiktok_profile&utm_content=tiktok_icon",
    icon: FileVideo2,
    label: "טיקטוק",
  },
];

export default function LinksPage() {
  return (
    <div className="flex flex-col items-center min-h-screen" dir="rtl">
      <div className="w-full max-w-md mx-auto">
        {/* Profile Section */}
        <header className="flex flex-col items-center mt-6">
          <Image
            src="/book-assets/profile.png"
            alt="The All-Business"
            width={96}
            height={96}
            className="rounded-full border-4 border-white shadow-lg"
            priority
          />
          <h1 className="text-3xl font-bold mt-4">רון קנטור</h1>
          <p className="text-center text-gray-200 mt-2">
            Senior Software Developer @ Google
          </p>
        </header>

        {/* Links Section */}
        <main className="space-y-4 mt-2 container">
          {/* Social Icons Section */}
          <div className="flex justify-center gap-4">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="text-white hover:text-pink-300 transition-colors duration-200 transform hover:scale-110"
              >
                <social.icon className="h-6 w-6" />
              </Link>
            ))}
          </div>

          {links.map((link) => (
            <Button
              key={link.text}
              asChild
              variant="secondary"
              className="w-full shadow-md transition-transform hover:scale-105 duration-200 ease-in-out group h-auto"
            >
              <Link
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center w-full"
              >
                <link.icon className="ml-3 h-6 w-6 text-blue-500 flex-shrink-0" />
                <span className="flex-grow text-right font-medium">
                  {link.text}
                </span>
                <ArrowUpRight className="mr-2 h-5 w-5 text-gray-500 group-hover:text-blue-500 transition-colors flex-shrink-0" />
              </Link>
            </Button>
          ))}
        </main>
      </div>
    </div>
  );
}
