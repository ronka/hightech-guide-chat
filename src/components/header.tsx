"use client";

import { cn } from "@/services/utils";
import { BookOpen, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "./ui/badge";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useSession, signOut } from "@/lib/auth-client";

const Header = () => {
  const pathname = usePathname();
  const isChatPage = pathname === "/chat";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  const navItems = [
    { href: "/", label: "לספר" },
    { href: "/chat", label: "לצ׳אט" },
    { href: "/explain", label: "מילון מושגים" },
    { href: "/cv-analysis", label: "ניתוח קורות חיים" },
    { href: "/cracking-the-job-interview", label: "לצלוח בראיון עבודה" },
    { href: "/questions", label: "שאלות מראיונות עבודה" },
    { href: "/#contact", label: "צור קשר" },
    { href: "https://www.ronka.dev", label: "לבלוג", target: "_blank" },
  ];

  return (
    <header className="sticky top-0 z-50 px-4 lg:px-6 h-14 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Link className="flex gap-4 items-center" href="/">
        <div className="rounded-full w-8 h-8 bg-blue-500 flex items-center justify-center text-2xl">
          🤖
          <span className="sr-only">המדריך להייטיקיסט המתחיל</span>
        </div>

        <div className={cn("gap-2", !isChatPage ? "hidden" : "flex")}>
          <span className="text-sm font-medium hover:underline underline-offset-4">
            הייטקיסטGPT
          </span>
          <Badge variant={"outline"}>beta</Badge>
        </div>
      </Link>

      <nav className="hidden sm:flex gap-4 sm:gap-6 items-center">
        {navItems.map((item) => (
          <Link
            key={item.href}
            className={cn(
              "text-sm font-medium hover:underline underline-offset-4",
              pathname === item.href && "underline"
            )}
            href={item.href}
            target={item.target}
          >
            {item.label}
          </Link>
        ))}
        {/* {session ? (
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            יציאה
          </Button>
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            כניסה
          </Link>
        )} */}
      </nav>

      <DropdownMenu>
        <DropdownMenuTrigger asChild className="sm:hidden">
          <Button variant="outline" size="icon">
            <Menu className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {navItems.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href} target={item.target}>
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
          {session ? (
            <DropdownMenuItem onClick={() => signOut()}>
              יציאה
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild>
              <Link href="/login">כניסה</Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export { Header };
