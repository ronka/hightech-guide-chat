"use client";

import { BOOK_PROMO } from "@/constants/links";
import { track } from "@/services/analytics";
import { CheckoutLink } from "@/components/checkout-link";
import Link from "next/link";
import { Button } from "../ui/button";

const RonkaCourseButton = () => {
  return (
    <Button className="w-full bg-blue-500" size={"lg"} asChild>
      <CheckoutLink product="job-interview-course" source="RonkaCourse">
        התחל עכשיו ב-99 ₪ בלבד! 🚀
      </CheckoutLink>
    </Button>
  );
};


const RonkaPhysicalBookButton = () => {
  return (
    <Button className="w-full bg-green-500" size={"lg"} asChild>
      <CheckoutLink product="physical-book" source="RonkaPhysical">
        אני רוצה כזה! עותק פיזי 📚
      </CheckoutLink>
    </Button>
  );
};

const RonkaDigitalBookButton = () => {
  return (
    <Button className="w-full bg-sky-500" size={"lg"} asChild>
      <CheckoutLink product="digital-book" source="RonkaDigitalEbook">
        אני רוצה כזה! עותק דיגיטלי 📱
      </CheckoutLink>
    </Button>
  );
};

const SteimatzkyButton = () => {
  return (
    <Button className="w-full bg-green-500" size={"lg"} asChild>
      <Link
        onClick={() => {
          track("book_click", { source: "Steimatzky", product_type: "physical_book" });
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
          track("book_click", { source: "Evrit", product_type: "digital_book" });
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
          track("consulting_click", { source });
        }}
        href={"/#contact"}
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
          track("consulting_click", { source });
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
