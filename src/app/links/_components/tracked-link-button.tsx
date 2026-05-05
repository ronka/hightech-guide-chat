"use client";

import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track, type EventName } from "@/services/analytics";

type TrackedLinkButtonProps = {
  href: string;
  text: string;
  icon: LucideIcon;
  eventName: EventName;
  source: string;
};

export function TrackedLinkButton({
  href,
  text,
  icon: Icon,
  eventName,
  source,
}: TrackedLinkButtonProps) {
  const isInternal = href.startsWith("/");

  return (
    <Button
      asChild
      variant="secondary"
      className="w-full shadow-md transition-transform hover:scale-105 duration-200 ease-in-out group h-auto"
    >
      <Link
        href={href}
        target={isInternal ? undefined : "_blank"}
        rel={isInternal ? undefined : "noopener noreferrer"}
        className="flex items-center w-full"
        onClick={() => track(eventName, { href, text, source })}
      >
        <Icon className="ml-3 h-6 w-6 text-blue-500 flex-shrink-0" />
        <span className="flex-grow text-right font-medium">{text}</span>
        <ArrowUpRight className="mr-2 h-5 w-5 text-gray-500 group-hover:text-blue-500 transition-colors flex-shrink-0" />
      </Link>
    </Button>
  );
}
