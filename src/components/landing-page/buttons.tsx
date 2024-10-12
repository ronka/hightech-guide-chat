"use client";

import { BOOK_PROMO } from "@/constants/links";
import { track } from "@/services/analytics";
import Link from "next/link";
import { Button } from "../ui/button";

const SteimatzkyButton = () => {
  return (
    <Button className="w-full bg-green-500" size={"lg"} asChild>
      <Link
        onClick={() => {
          track("Book Landing Page Click", {
            source: "STEIMATZKY",
          });
        }}
        href={BOOK_PROMO.STEIMATZKY}
      >
        אני רוצה כזה! דרך סטימצקי 📚
      </Link>
    </Button>
  );
};

const EvritButton = () => {
  return (
    <Button className="w-full bg-sky-500" size={"lg"} asChild>
      <Link
        onClick={() => {
          track("Book Landing Page Click", {
            source: "EVRIT",
          });
        }}
        href={BOOK_PROMO.EVRIT}
      >
        אני רוצה כזה! דרך ע-ברית 📱
      </Link>
    </Button>
  );
};

const ChatBotButton = () => {
  return (
    <Button className="w-full" size={"lg"} asChild>
      <Link href={"/chat"}>בואו לדבר עם הספר 🤖</Link>
    </Button>
  );
};

const ConsultingButton = () => {
  return (
    <Button className="w-full" size={"lg"} variant={"outline"} asChild>
      <Link
        onClick={() => {
          track("Consulting Form Click", {
            source: "landing-page",
          });
        }}
        href={"https://ronka.dev/consulting-session-form"}
      >
        רוצים ייעוץ אישי בהייטק? השאירו פרטים ואחזור אליכם! 💡
      </Link>
    </Button>
  );
};

export { SteimatzkyButton, EvritButton, ChatBotButton, ConsultingButton };
