"use client";

import { cn } from "@/services/utils";
import { BookOpen, Linkedin } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "./ui/badge";

const Header = () => {
  const pathname = usePathname();

  const isChatPage = pathname === "/chat";

  return (
    <header className="px-4 lg:px-6 h-14 flex items-center gap-20 justify-center">
      <Link className="flex gap-4 items-center" href="/">
        <div className="rounded-full w-8 h-8 bg-[#55efc4] flex items-center justify-center text-2xl">
          🤖
          <span className="sr-only">המדריך להייטיקיסט המתחיל</span>
        </div>

        <div className={cn("flex gap-2", !isChatPage && "opacity-0")}>
          <span className="text-sm font-medium hover:underline underline-offset-4">
            הייטקיסטGPT
          </span>
          <Badge variant={"outline"}>beta</Badge>
        </div>
      </Link>

      <nav className="flex gap-4 sm:gap-6">
        <Link
          className={cn(
            "text-sm font-medium hover:underline underline-offset-4",
            isChatPage && "underline"
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
