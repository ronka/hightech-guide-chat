"use client";

import { BOOK_PROMO } from "@/constants/links";
import { track } from "@/services/analytics";
import Link from "next/link";
import { Button } from "../ui/button";

const RONKA_BOOK_PYSHICAL_ID = "704";
const RONKA_BOOK_DIGITAL_ID = "712";
const RONKA_COURSE_ID = "819";


const RonkaCourseButton = () => {
  return (
    <Button className="w-full bg-blue-500" size={"lg"} asChild>
      <Link
        href={`https://ronka.dev/cart/?custom-add-to-cart=${RONKA_COURSE_ID}&quantity=1&utm_source=htstarter&utm_medium=button&utm_campaign=physical_book&utm_content=physical_book_button`}
      >
        התחל עכשיו ב-99 ₪ בלבד! 🚀
      </Link>
    </Button>
  );
};


const RonkaPhysicalBookButton = () => {
  return (
    <Button className="w-full bg-green-500" size={"lg"} asChild>
      <Link
        href={`https://ronka.dev/checkout/?custom-add-to-cart=${RONKA_BOOK_PYSHICAL_ID}&quantity=1&utm_source=ronka_dev&utm_medium=button&utm_campaign=physical_book&utm_content=physical_book_button`}
      >
        אני רוצה כזה! עותק פיזי 📚
      </Link>
    </Button>
  );
};

const RonkaDigitalBookButton = () => {
  return (
    <Button className="w-full bg-sky-500" size={"lg"} asChild>
      <Link
        href={`https://ronka.dev/checkout/?custom-add-to-cart=${RONKA_BOOK_DIGITAL_ID}&quantity=1&utm_source=ronka_dev&utm_medium=button&utm_campaign=digital_book&utm_content=digital_book_button`}
      >
        אני רוצה כזה! עותק דיגיטלי 📱
      </Link>
    </Button>
  );
};

const SteimatzkyButton = () => {
  return (
    <Button className="w-full bg-green-500" size={"lg"} asChild>
      <Link
        onClick={() => {
          track("view_content", {
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
          track("view_content", {
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
    <Button size={"lg"} asChild>
      <Link href={"/chat"}>בואו לדבר עם הספר 🤖</Link>
    </Button>
  );
};

const ConsultingButton = ({ source = "landing-page" }: { source?: string }) => {
  return (
    <Button className="w-full" size={"lg"} variant={"outline"} asChild>
      <Link
        onClick={() => {
          track("view_content", {
            source,
          });
        }}
        href={"https://ronka.dev/consulting-session-form"}
      >
        רוצים ייעוץ אישי בהייטק? השאירו פרטים ואחזור אליכם! 💡
      </Link>
    </Button>
  );
};

const CVConsultingButton = ({
  source = "cv-analysis",
}: {
  source?: string;
}) => {
  return (
    <Button className="w-full bg-green-500" size={"lg"} asChild>
      <Link
        onClick={() => {
          track("view_content", {
            source,
          });
        }}
        href={"https://ronka.dev/consulting-session-form"}
      >
        קבעו פגישת ייעוץ לשיפור קורות החיים שלכם 📝
      </Link>
    </Button>
  );
};

const CrackingTheJobInterviewButton = () => {
  return (
    <Button className="w-full bg-gray-300" size={"lg"} asChild>
      <Link href={"/cracking-the-job-interview"}>
        אני רוצה לעבור את ראיון העבודה הבא שלי בהצלחה 🎓{" "}
      </Link>
    </Button>
  );
};

export {
  SteimatzkyButton,
  EvritButton,
  ChatBotButton,
  CrackingTheJobInterviewButton,
  ConsultingButton,
  CVConsultingButton,
  RonkaPhysicalBookButton,
  RonkaCourseButton,
  RonkaDigitalBookButton,
};
