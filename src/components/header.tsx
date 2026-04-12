"use client";

import { cn } from "@/services/utils";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import { useSession, signOut } from "@/lib/auth-client";

const courseItems = [
  { href: "/cracking-the-job-interview", label: "לצלוח בראיון עבודה", description: "לצלוח קורס דיגיטלי מקיף עם +25 שיעורים מעשיים" },
  { href: "/start-working-with-ai", label: "להתחיל לעבוד עם AI", description: "מעשי ומקיף ללמוד לפתח עם AI מאפס – מהבנת LLMs ועד בניית אפליקציה אמיתית עם Claude Code." },
];

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href} className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
          <div className="flex flex-col gap-1 text-sm">
            <div className="leading-none font-medium">{title}</div>
            <div className="line-clamp-2 text-muted-foreground">{children}</div>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}

type NavItem = {
  href: string;
  label: string;
  target?: string;
}

const Header = () => {
  const pathname = usePathname();
  const isChatPage = pathname === "/chat";
  const { data: session } = useSession();

  const navItemsBefore: NavItem[] = [
    { href: "/", label: "לספר" },
    { href: "/chat", label: "לצ׳אט" },
    { href: "/explain", label: "מילון מושגים" },
  ];

  const navItemsAfter: NavItem[] = [
    { href: "/cv-analysis", label: "ניתוח קורות חיים" },
    { href: "/questions", label: "שאלות מראיונות עבודה" },
    { href: "/#contact", label: "צור קשר" },
    { href: "https://www.ronka.dev", label: "לבלוג", target: "_blank" },
  ];

  const allNavItems = [...navItemsBefore, ...navItemsAfter];

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

      {/* Desktop nav */}
      <NavigationMenu className="hidden sm:flex">
        <NavigationMenuList>
          {navItemsBefore.map((item) => (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink
                asChild
                className={cn(
                  navigationMenuTriggerStyle(),
                  pathname === item.href && "underline underline-offset-4"
                )}
              >
                <Link href={item.href}>{item.label}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}

          <NavigationMenuItem>
            <NavigationMenuTrigger>קורסים</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="w-96 p-2">
                {courseItems.map((item) => (
                  <ListItem
                    key={item.href}
                    href={item.href}
                    title={item.label}
                  >
                    {item.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {navItemsAfter.map((item) => (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink
                asChild
                className={cn(
                  navigationMenuTriggerStyle(),
                  pathname === item.href && "underline underline-offset-4"
                )}
              >
                <Link href={item.href} target={item.target}>
                  {item.label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Mobile hamburger */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="sm:hidden">
          <Button variant="outline" size="icon">
            <Menu className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {allNavItems.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href} target={item.target}>
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            קורסים
          </DropdownMenuLabel>
          {courseItems.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href}>{item.label}</Link>
            </DropdownMenuItem>
          ))}
          {session ? (
            <DropdownMenuItem onClick={() => signOut()}>יציאה</DropdownMenuItem>
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
