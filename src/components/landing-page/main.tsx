import Image from "next/image";
import { Quote, ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Quotes } from "./quotes";
import { Section } from "./section";
import Link from "next/link";
import { track } from "@/services/analytics";
import { BOOK_PROMO } from "@/constants/links";
import { ChatBotButton, EvritButton, SteimatzkyButton } from "./buttons";

const Main = () => {
  return (
    <main className="flex-1">
      <section className="w-full py-12 relative">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] ">
            <div className="absolute inset-0 -z-10">
              <Image
                src="/book-assets/background.png"
                alt="Background"
                layout="fill"
                objectFit="cover"
                className="opacity-10 dark:opacity-10"
              />
            </div>
            <img
              alt="Book Cover"
              className="mx-auto aspect-[2/3] overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              src="/book-assets/book.png"
            />
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2 ">
                <div className="flex items-center gap-4 space-x-2 mb-2">
                  <Badge className="text-sm py-1">
                    פרוייקט Headstart שגוייס בהצלחה!
                  </Badge>
                  <Badge variant="secondary" className="text-sm py-1">
                    הספר הראשון שאפשר לדבר איתו באמצעות AI!
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  המדריך להייטיקיסט המתחיל
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  צאו למסע מעשי בעולם ההייטק, מתחילת דרכי בבלוגים ועד לעבודה
                  בגוגל. ספר זה מהווה מדריך פרקטי לשאפתנים בתחום, המשלב לקחים
                  מלימוד עצמי, שירות צבאי וחינוך אקדמי. גלו תובנות, טיפים
                  ואסטרטגיות מעשיות לבניית קריירה מוצלחת בתכנות, המבוססות על
                  ניסיון אמיתי בשטח.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <SteimatzkyButton />
                <EvritButton />
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <ChatBotButton />
              </div>
            </div>
          </div>
        </div>
      </section>
      <Section>
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2 w-full md:w-1/2 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-8">
              על הספר
            </h2>
            <div className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400 text-right">
              <p>
                המדריך להייטקיסט המתחיל מתאר את מסעו האישי של המחבר רון קנטור,
                אני 😄, בעולם ההייטק, מהימים הראשונים בחברת תוכנה קטנה ועד
                לטיפוס בסולם תאגידי ועבודה בגוגל.
              </p>
              <p>
                הספר משמש מדריך שימושי עבור אנשים המעוניינים לעבוד בהייטק או
                העושים את צעדיהם הראשונים בעולם זה, והוא מכיל תובנות וחוויות
                משמעותיות בשילוב מומחיות רבה והומור.
              </p>
              <p>
                הספר מעודד למידה עצמית ומציע טיפים ושיטות שעשויים לסייע לקוראים
                לפתח את כישוריהם, הכוונה בקריירה, עצות לריאיון ואפילו מידע על
                עולם האופציות והמניות בסטארטאפים.
              </p>
              <p>
                כל מה שרציתם לדעת ולא העזתם לשאול על עולם ההייטק המורכב תוכלו
                למצוא בספר שבידיכם.
              </p>
            </div>
          </div>
        </div>{" "}
      </Section>
      <Section dark>
        <div className="flex md:grid-cols-2 md:flex-row flex-col items-center justify-center space-y-4 text-center gap-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter text-muted-foreground sm:text-5xl">
              נעיר להכיר
            </h2>
            <h2 className=" text-3xl font-bold tracking-tighter sm:text-5xl">
              רון קנטור
            </h2>
            <div className="pt-10 max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400 text-right">
              <p>
                מפתח תוכנה בגוגל, ובעבר עבדתי בסטארט-אפים ובחברות קטנות. התחלתי
                את דרכי כחייל קרבי בהנדסה קרבית, ומשם התפתחתי לעולם התכנות.
              </p>
              <p>
                למדתי לתואר במדעי המחשב באוניברסיטה הפתוחה תוך כדי עבודה במשרה
                מלאה. אני מאמין גדול בלמידה עצמית ובכוחה של התמדה להוביל להצלחה.
              </p>
              <p>
                אני לא יועץ קריירה, אלא פשוט מתכנת עם 10 שנות ניסיון שאוהב את
                עבודתו, ללמד, לעזור ורוצה לחלוק את הניסיון שצבר. מטרתי היא
                להעניק השראה ותובנות מעשיות לכל מי שחולם על קריירה בעולם
                הטכנולוגיה.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Image
              alt="תמונה של רון קנטור"
              width={300}
              height={300}
              src={"/book-assets/profile.png"}
            />
          </div>
        </div>
      </Section>

      <Section>
        <Quotes />
      </Section>
    </main>
  );
};

export { Main };
