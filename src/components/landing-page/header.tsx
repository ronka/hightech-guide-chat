"use client";

import { cn } from "@/services/utils";
import { BookOpen, Linkedin } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="px-4 lg:px-6 h-14 flex items-center gap-20 justify-center">
      <Link className="flex gap-4" href="#">
        <BookOpen className="h-6 w-6" />
        <span className="sr-only">המדריך להייטיקיסט המתחיל</span>
      </Link>
      <nav className="flex gap-4 sm:gap-6">
        <Link
          className={cn(
            "text-sm font-medium hover:underline underline-offset-4",
            pathname === "/chat" && "underline"
          )}
          href="/chat"
        >
          לצ׳אט
        </Link>
        <Link
          className={cn(
            "text-sm font-medium hover:underline underline-offset-4",
            pathname === "/" && "underline"
          )}
          href="/"
        >
          לספר
        </Link>
        <Link
          className="text-sm font-medium hover:underline underline-offset-4"
          href="/#contact"
        >
          צור קשר
        </Link>
        <Link
          className="text-sm font-medium hover:underline underline-offset-4"
          target="_blank"
          href="https://www.ronka.dev"
        >
          לבלוג
        </Link>
      </nav>
    </header>
  );
};

export { Header };
