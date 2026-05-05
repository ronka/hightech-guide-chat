import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { TrackedLinkButton } from "../_components/tracked-link-button";

export const metadata: Metadata = {
  metadataBase: new URL("https://ronka.dev"),
  title: "רון קנטור - מיטאפים לא לפספס (05-05-2026)",
  description:
    "רשימת המיטאפים שכדאי לכם להגיע אליהם השבוע - פרונטאנדיסטים, Claude Israel, Wix ועוד.",
  openGraph: {
    title: "רון קנטור - מיטאפים לא לפספס (05-05-2026)",
    description:
      "רשימת המיטאפים שכדאי לכם להגיע אליהם השבוע - פרונטאנדיסטים, Claude Israel, Wix ועוד.",
    images: ["/cracking-the-job-interview/opengraph-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "רון קנטור - מיטאפים לא לפספס (05-05-2026)",
    description:
      "רשימת המיטאפים שכדאי לכם להגיע אליהם השבוע - פרונטאנדיסטים, Claude Israel, Wix ועוד.",
    images: ["/cracking-the-job-interview/twitter-image.png"],
  },
};

const meetups = [
  {
    href: "https://www.meetup.com/at-wix/events/314505183/?eventOrigin=group_events_list",
    text: "[Wix] AI-Native Development: From Understanding Code to Fixing It Autonomously",
    icon: Calendar,
  },
  {
    href: "https://www.meetup.com/frontendistim-meetup-group/events/313710167/?recId=f81a8e15-ef02-45b0-8797-58155cb3d88d&recSource=ml-popular-events-nearby-offline&searchId=04c5ed9a-c488-4a29-8716-767468b0cbdf&eventOrigin=find_page%24all",
    text: "פרונטאנדיסטים - Frontendistim Meetup",
    icon: Calendar,
  },
  {
    href: "https://luma.com/4zgelqdk?tk=7P7nGa",
    text: "RedisTLV: Building Stateful AI Systems",
    icon: Calendar,
  },
  {
    href: "https://www.meetup.com/claude-israel-user-group/events/314525278/?recId=f81a8e15-ef02-45b0-8797-58155cb3d88d&recSource=ml-popular-events-nearby-offline&searchId=04c5ed9a-c488-4a29-8716-767468b0cbdf&eventOrigin=find_page%24all",
    text: "Claude Israel User Group",
    icon: Calendar,
  },
];

export default function MeetupsNotToMissPage() {
  return (
    <div className="flex flex-col items-center min-h-screen" dir="rtl">
      <div className="w-full max-w-md mx-auto">
        <header className="flex flex-col items-center mt-6">
          <Image
            src="/book-assets/profile.png"
            alt="The All-Business"
            width={96}
            height={96}
            className="rounded-full border-4 border-white shadow-lg"
            priority
          />
          <h1 className="text-3xl font-bold mt-4">מיטאפים לא לפספס</h1>
          <p className="text-center text-gray-200 mt-2">05-05-2026</p>
        </header>

        <main className="space-y-4 mt-6 container">
          {meetups.map((meetup) => (
            <TrackedLinkButton
              key={meetup.text}
              href={meetup.href}
              text={meetup.text}
              icon={meetup.icon}
              eventName="meetup_link_click"
              source="meetups_not_to_miss_05_05_2026"
            />
          ))}

          <Button
            asChild
            variant="ghost"
            className="w-full mt-6"
          >
            <Link href="/links" className="flex items-center justify-center">
              <ArrowRight className="ml-2 h-4 w-4" />
              <span>חזרה לכל הקישורים</span>
            </Link>
          </Button>
        </main>
      </div>
    </div>
  );
}
