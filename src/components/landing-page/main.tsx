import Image from "next/image";
import { Badge } from "../ui/badge";
import { Quotes } from "./quotes";
import { Section } from "./section";
import {
  ChatBotButton,
  ConsultingButton,
  CrackingTheJobInterviewButton,
  RonkaDigitalBookButton,
  RonkaPhysicalBookButton,
} from "./buttons";
import TableOfContents from "./table-of-content";
import { ContactForm } from "./contact-form";
import { About } from "./about";

const Main = () => {
  return (
    <main className="flex-1">
      <section className="w-full py-12 relative overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 ">
            <div className="absolute inset-0 -z-10">
              <Image
                src="/book-assets/background.png"
                alt="Background"
                layout="fill"
                objectFit="cover"
                className="opacity-10 dark:opacity-10 not-sr-only"
              />
            </div>
            <img
              alt="Book Cover"
              className="mx-auto aspect-[2/3] overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              src="/book-assets/book.png"
            />
            <div className="flex flex-col justify-center space-y-4 max-w-xl">
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
                <RonkaPhysicalBookButton />
                <RonkaDigitalBookButton />
              </div>

              <div className="flex flex-col gap-2 min-[400px]:flex-row items-center">
                <CrackingTheJobInterviewButton />
                <span className="text-amber-500 font-semibold text-lg ml-2 rtl:mr-2">
                  רק 99 ₪{" "}
                  <span className="line-through text-gray-400 text-base">
                    299 ₪
                  </span>
                </span>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <ConsultingButton />
              </div>
            </div>
          </div>
        </div>
      </section>
      <Section>
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2 w-full md:w-1/2 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-8">
              על הספר 📗
            </h2>
            <div className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400 text-right">
              <p>
                המדריך להייטקיסט המתחיל התחיל את דרכו כסדרת פוסטים בבלוג שלי.
                לאחר שקיבלתי שאלות רבות מקוראים על נושאים שונים שהעליתי בבלוג,
                עלה הרעיון להפוך את התוכן לספר מקיף. כדי להפוך את החלום למציאות,
                יזמתי קמפיין מימון המונים ב-<b>Headstart</b> שהסתיים בהצלחה עם
                מעל ל-160 תומכים!
              </p>

              <p>
                הספר מתאר את המסע האישי שלי, בעולם ההייטק, החל מהימים הראשונים
                בחברת תוכנה קטנה ועד לטיפוס בסולם התאגידי ועבודה בגוגל. הוא משמש
                מדריך שימושי עבור אנשים המעוניינים לעבוד בהייטק או העושים את
                צעדיהם הראשונים בעולם זה, ומכיל תובנות וחוויות משמעותיות בשילוב
                מומחיות רבה והומור.
              </p>
              <p>
                המדריך מעודד למידה עצמית ומציע טיפים ושיטות שעשויים לסייע
                לקוראים לפתח את כישוריהם, הכוונה בקריירה, עצות לריאיון ואפילו
                מידע על עולם האופציות והמניות בסטארטאפים. כל מה שרציתם לדעת ולא
                העזתם לשאול על עולם ההייטק המורכב תוכלו למצוא בספר שבידיכם.
              </p>
            </div>

            <div className="flex justify-center">
              <ChatBotButton />
            </div>
          </div>
        </div>
      </Section>
      <Section dark>
        <TableOfContents />
      </Section>
      <Section>
        <About />
      </Section>
      <Section dark>
        <Quotes />
      </Section>

      <Section id="contact">
        <ContactForm />
      </Section>
    </main>
  );
};

export { Main };
