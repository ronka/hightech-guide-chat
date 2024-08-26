"use client";

import { BOOK_PROMO } from "@/constants/links";
import { track } from "@/services/analytics";
import Link from "next/link";
import { Button } from "../ui/button";

const SteimatzkyButton = () => {
  return (
    <Button className="w-full bg-green-500" asChild>
      <span
        onClick={() => {
          track("Book Landing Page Click", {
            source: "STEIMATZKY",
          });
        }}
      >
        <Link href={BOOK_PROMO.STEIMATZKY}>אני רוצה כזה! דרך סטימצקי 📚</Link>
      </span>
    </Button>
  );
};

const EvritButton = () => {
  return (
    <Button className="w-full bg-sky-500" asChild>
      <span
        onClick={() => {
          track("Book Landing Page Click", {
            source: "EVRIT",
          });
        }}
      >
        <Link href={BOOK_PROMO.EVRIT}>אני רוצה כזה! דרך ע-ברית 📱</Link>
      </span>
    </Button>
  );
};

export { SteimatzkyButton, EvritButton };
