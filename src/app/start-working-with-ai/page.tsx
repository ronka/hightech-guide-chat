"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, ArrowLeft, Clock } from "lucide-react";
import { About } from "@/components/landing-page/about";
import { AnimatedStudentsCounter } from "@/components/animated-students-counter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { track } from "@/services/analytics";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { type CourseSlug } from "@/lib/paylinks";

const COURSE_SLUG = "ai-course" satisfies CourseSlug;

function CourseCta({
  isPurchased,
  onBuyClick,
  children,
  size,
}: {
  isPurchased: boolean;
  onBuyClick: () => void;
  children: React.ReactNode;
  size?: "default" | "xl";
}) {
  if (isPurchased) {
    return (
      <Link
        href={`/courses/${COURSE_SLUG}`}
        className={`inline-flex items-center justify-center rounded-md bg-gradient-to-r from-green-500 to-green-700 text-base font-medium text-white shadow-lg transition-all duration-500 hover:from-green-600 hover:via-green-600 hover:to-green-600 hover:shadow-xl hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 hover:animate-none relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent ${size === "xl" ? "px-8 py-4 text-lg" : "px-6 py-3 text-base"}`}
      >
        כניסה לקורס ←
      </Link>
    );
  }
  return (
    <a
      href="https://forms.gle/jMms7fX11cHxzUSV8"
      target="_blank"
      rel="noopener noreferrer"
      onClick={onBuyClick}
      className={`inline-flex items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-blue-800 font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${size === "xl" ? "px-8 py-4 text-lg" : "px-6 py-3 text-base"}`}
    >
      {children}
    </a>
  );
}

export default function StartWorkingWithAIPage() {
  useEffect(() => {
    track("view_content", {
      content_type: "course_page",
      content_id: "start-working-with-ai",
      course_name: "מתחילים לעבוד עם AI",
      page_title: "מתחילים לעבוד עם AI: הקורס המעשי לפיתוח עם בינה מלאכותית",
      currency: "ILS",
      value: 199,
    });
  }, []);

  const { data: session } = authClient.useSession();

  const { data: purchaseData } = useQuery({
    queryKey: ["purchase-check", COURSE_SLUG],
    queryFn: () =>
      fetch(`/api/purchases/check?courseSlug=${COURSE_SLUG}`).then((r) => r.json()),
    enabled: !!session?.user,
  });

  const isPurchased = purchaseData?.purchased ?? false;

  const handleAccordionOpen = (section: string) => {
    track("view_content", {
      content_type: "course_section",
      section_name: section,
      course_name: "מתחילים לעבוד עם AI",
      interaction_type: "accordion_open",
    });
  };

  const handleBuyButtonClick = (location: string) => {
    track("add_to_cart", {
      content_type: "course",
      content_id: "start-working-with-ai",
      course_name: "מתחילים לעבוד עם AI",
      currency: "ILS",
      value: 199,
      button_location: location,
    });
  };

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="w-full border-b text-gray-200 relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image
            src="/book-assets/background.png"
            alt="Background"
            layout="fill"
            objectFit="cover"
            className="opacity-10 dark:opacity-10 not-sr-only"
          />
        </div>
        <div className="container px-4 md:px-6 py-12 md:py-24 lg:py-32">
          <div className="flex flex-col items-center space-y-6 text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              תתחיל לפתח עם AI{" "}
              <span className="inline-block decoration-primary relative">
                <span className="relative z-10">עוד היום</span>
                <span className="bottom-0 absolute bg-blue-700 h-4 md:h-6 md:-bottom-0.5 -inset-x-2"></span>
              </span>
            </h1>

            <p className="text-lg font-medium text-green-400">
              מועבר על ידי מפתח בכיר עם 10 שנות ניסיון בהייטק שבונה כלי AI
              בעצמו
            </p>

            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              קורס מעשי ומקיף עם 7 מודולים – מהבנת LLMs ועד בניית אפליקציה
              אמיתית עם Claude Code. ללא ידע קודם בנדרש.
            </p>

            <div className="flex flex-col items-center w-full gap-3 pt-4">
              <CourseCta
                isPurchased={isPurchased}
                onBuyClick={() => handleBuyButtonClick("hero")}
                size="xl"
              >
                🚀 אני רוצה לפתח עם AI
              </CourseCta>
              {/* <AnimatedStudentsCounter /> */}
            </div>

            {/* Coming Soon Video Placeholder */}
            <div className="relative mt-8 flex w-full max-w-3xl items-center justify-center">
              <div className="relative w-full overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-xl">
                <div className="flex items-center gap-4 border-b border-gray-700 px-4 py-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-sm font-medium text-gray-300">
                    סרטון מבוא לקורס
                  </div>
                </div>
                <div className="p-4">
                  <div
                    className="relative w-full flex items-center justify-center bg-gray-900 rounded-md"
                    style={{ paddingBottom: "56.25%" }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400">
                      <div className="text-5xl">🎬</div>
                      <p className="text-lg font-semibold text-gray-300">
                        סרטון מבוא – בקרוב!
                      </p>
                      <p className="text-sm text-gray-500 max-w-xs text-center">
                        הסרטון יעלה בקרוב. הירשם לקורס ותקבל עדכון כשהוא זמין.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                למה להמשיך לנסות לבד כשאפשר ללמוד נכון מהתחלה?
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                הפסק לבזבז זמן על מדריכים מפוזרים ב-YouTube – קבל מסלול ברור
                מקצה לקצה
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-2">
            <div className="rounded-xl card rounded-box bg-base-100 border border-red-300 bg-red-950/10 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">😩</span>
                <h3 className="text-xl font-bold text-rose-500">
                  בלי הקורס: אבוד בעולם ה-AI
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>לא ברור מאיפה להתחיל ומה ללמוד קודם</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>פחד מטכנולוגיה שנראית מסובכת ומרתיעה</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>שעות של מדריכים ב-YouTube בלי תוצאה אמיתית</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>תחושה שה-AI מתקדם מהר מדי ואתה נשאר מאחור</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>כלים הרבה – אבל אין מושג איזה מהם כדאי לאמץ</span>
                </li>
              </ul>
            </div>
            <div className="rounded-xl p-6 shadow-sm card rounded-box bg-base-100 border border-green-300 bg-green-950/10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">😎</span>
                <h3 className="text-xl font-bold text-green-500">
                  עם הקורס: בונה אפליקציות עם AI
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-green-500"></span>
                  <span>בניית MVP אמיתי מאפס עם כלי AI מודרניים</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-green-500"></span>
                  <span>הבנה מעמיקה של איך LLMs עובדים ואיך לנצל אותם</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-green-500"></span>
                  <span>ביטחון לבחור את הכלים הנכונים לכל פרויקט</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-green-500"></span>
                  <span>חיסכון של חודשים של ניסוי וטעייה</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-green-500"></span>
                  <span>מיומנות שתהיה רלוונטית לשנים הבאות</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-2">
              <CourseCta
                isPurchased={isPurchased}
                onBuyClick={() => handleBuyButtonClick("comparison")}
              >
                <span>רוצה לחסוך חודשים של טעויות - קנה עכשיו</span>
                <ArrowLeft className="ml-2 h-4 w-4" />
              </CourseCta>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <About />
        </div>
      </section>

      {/* What You Will Learn Section */}
      <section
        id="learn"
        className="w-full py-12 md:py-24 lg:py-32 bg-background"
      >
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                מה תלמדו
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                7 מודולים שלוקחים אותך מאפס – להבנת AI ועד בניית אפליקציה
                אמיתית
              </p>
            </div>
          </div>
          <div className="mx-auto max-w-5xl py-12">
            <Accordion type="multiple" className="w-full space-y-4">
              <AccordionItem
                value="intro"
                className="border border-border rounded-lg px-6"
              >
                <AccordionTrigger
                  className="text-xl font-bold text-right"
                  onClick={() => handleAccordionOpen("מבוא לקורס")}
                >
                  1. מבוא לקורס
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground mb-4">
                    היכרות עם הקורס, מפת הדרכים, ושינוי תפיסת החשיבה לעבודה עם
                    AI.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">מה הקורס הזה</div>
                        <div className="text-sm text-muted-foreground">
                          על מה הקורס ומה נלמד בו
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~5 דקות</span>
                      </div>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">מפת דרכים</div>
                        <div className="text-sm text-muted-foreground">
                          מה נעבור בכל מודול ולמה
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~4 דקות</span>
                      </div>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">שינוי מיינדסט</div>
                        <div className="text-sm text-muted-foreground">
                          איך לחשוב על AI כשותף עבודה
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~5 דקות</span>
                      </div>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="how-ai-works"
                className="border border-border rounded-lg px-6"
              >
                <AccordionTrigger
                  className="text-xl font-bold text-right"
                  onClick={() => handleAccordionOpen("הבנה איך עובד AI")}
                >
                  2. הבנה איך עובד AI
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground mb-4">
                    הבנה מעמיקה של מה זה LLM, מה הוא לומד, ואיך עובד תהליך
                    האימון.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">מה זה LLM</div>
                        <div className="text-sm text-muted-foreground">
                          הסבר אינטואיטיבי על מודלי שפה גדולים
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~6 דקות</span>
                      </div>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">מה ה-AI לומד</div>
                        <div className="text-sm text-muted-foreground">
                          מאיפה מגיע הידע של המודל ומה גבולותיו
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~5 דקות</span>
                      </div>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">איך עובד האימון</div>
                        <div className="text-sm text-muted-foreground">
                          תהליך ה-training בקצרה ומה אפשר להסיק ממנו
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~7 דקות</span>
                      </div>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="dev-basics"
                className="border border-border rounded-lg px-6"
              >
                <AccordionTrigger
                  className="text-xl font-bold text-right"
                  onClick={() => handleAccordionOpen("היסודות של פיתוח")}
                >
                  3. היסודות של פיתוח תכונה
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground mb-4">
                    יסודות HTML, CSS ו-JavaScript שצריך להכיר לפני שמתחילים
                    לפתח עם AI.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">HTML & CSS בייסיק</div>
                        <div className="text-sm text-muted-foreground">
                          מה שצריך להכיר כדי להבין מה ה-AI כותב
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~8 דקות</span>
                      </div>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">להתחיל עם AI</div>
                        <div className="text-sm text-muted-foreground">
                          הצעד הראשון – לכתוב פרומפט ראשון לפיתוח
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~6 דקות</span>
                      </div>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">JavaScript בייסיק</div>
                        <div className="text-sm text-muted-foreground">
                          קונספטים בסיסיים שיעזרו לך לקרוא ולהבין קוד
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~7 דקות</span>
                      </div>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="ai-dev-concepts"
                className="border border-border rounded-lg px-6"
              >
                <AccordionTrigger
                  className="text-xl font-bold text-right"
                  onClick={() => handleAccordionOpen("קונספטים של פיתוח עם AI")}
                >
                  4. קונספטים של פיתוח עם AI
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground mb-4">
                    סוגי כלי AI, האבולוציה של ה-agents, ו-best practices
                    לפיתוח עם AI.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">סוגי כלי AI</div>
                        <div className="text-sm text-muted-foreground">
                          מה ההבדל בין chatbot, copilot ו-agent
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~6 דקות</span>
                      </div>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">
                          האבולוציה של ה-Agents
                        </div>
                        <div className="text-sm text-muted-foreground">
                          איך AI agents מתפתחים ולאן זה הולך
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~5 דקות</span>
                      </div>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">Best Practices</div>
                        <div className="text-sm text-muted-foreground">
                          כללי עבודה שיחסכו לך הרבה תסכול
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~7 דקות</span>
                      </div>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="ai-dev-tools"
                className="border border-border rounded-lg px-6"
              >
                <AccordionTrigger
                  className="text-xl font-bold text-right"
                  onClick={() => handleAccordionOpen("כלים לפיתוח עם AI")}
                >
                  5. כלים לפיתוח עם AI
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground mb-4">
                    כלים לבניית MVP עם AI, השוואה בין הפלטפורמות, ו-AI IDEs
                    שיהפכו את הפיתוח לפשוט יותר.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">בניית MVP עם AI</div>
                        <div className="text-sm text-muted-foreground">
                          מה זה MVP ואיך AI עוזר להגיע אליו מהר
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~6 דקות</span>
                      </div>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">
                          כלי MVP – יתרונות וחסרונות
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Cursor, Bolt, Lovable, v0 – מה מתאים למה
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~8 דקות</span>
                      </div>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">AI IDEs</div>
                        <div className="text-sm text-muted-foreground">
                          Claude Code, Cursor ועוד – מה לבחור ולמה
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~7 דקות</span>
                      </div>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="build-app"
                className="border border-border rounded-lg px-6"
              >
                <AccordionTrigger
                  className="text-xl font-bold text-right"
                  onClick={() => handleAccordionOpen("בניית אפליקציה מאפס")}
                >
                  6. בניית אפליקציה מאפס
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground mb-4">
                    מה נבנה, קלון והתקנה, הגדרת Claude Code, ובניית הממשק
                    מאפס.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">מה נבנה</div>
                        <div className="text-sm text-muted-foreground">
                          תיאור הפרויקט שנבנה יחד בקורס
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~3 דקות</span>
                      </div>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">Clone & Install</div>
                        <div className="text-sm text-muted-foreground">
                          שיבוט הפרויקט והתקנת תלויות
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~5 דקות</span>
                      </div>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">הגדרת Claude Code</div>
                        <div className="text-sm text-muted-foreground">
                          הכנת סביבת הפיתוח עם Claude Code
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~6 דקות</span>
                      </div>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">בניית ה-UI</div>
                        <div className="text-sm text-muted-foreground">
                          בניית ממשק המשתמש צעד אחר צעד עם AI
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~15 דקות</span>
                      </div>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="next-steps"
                className="border border-border rounded-lg px-6"
              >
                <AccordionTrigger
                  className="text-xl font-bold text-right"
                  onClick={() => handleAccordionOpen("צעדים להמשך")}
                >
                  7. צעדים להמשך
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground mb-4">
                    משאבים להמשך הלמידה, טיפים לשימוש יומי ב-AI, וניהול עצמי
                    לשמירת הכישורים.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">משאבים להמשך</div>
                        <div className="text-sm text-muted-foreground">
                          הכלים, הקהילות והמדריכים שממשיכים ממנו
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~4 דקות</span>
                      </div>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">שימוש יומי ב-AI</div>
                        <div className="text-sm text-muted-foreground">
                          איך לשלב AI ביום העבודה בצורה אפקטיבית
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~5 דקות</span>
                      </div>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">
                          ניהול עצמי ושמירת כישורים
                        </div>
                        <div className="text-sm text-muted-foreground">
                          איך לא לאבד את מה שלמדת ולהמשיך להתפתח
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~4 דקות</span>
                      </div>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <CourseCta
              isPurchased={isPurchased}
              onBuyClick={() => handleBuyButtonClick("curriculum")}
            >
              <span>אני רוצה ללמוד ולהצליח!</span>
              <ArrowLeft className="ml-2 h-4 w-4" />
            </CourseCta>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="w-full py-12 md:py-24 lg:py-32 bg-muted"
      >
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 px-10 md:gap-16 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                חבילה מלאה
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                תפסיקו לנחש. קבלו את הכלים לפתח עם AI מהיום הראשון.
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                מעבר לתיאוריה: זו מערכת מעשית, צעד-אחר-צעד, שבסופה יוצאים עם
                אפליקציה עובדת ויכולת לבנות הבאה.
              </p>
              <div className="space-y-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>הבן איך LLMs עובדים ואיך לנצל אותם נכון</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>למד HTML, CSS ו-JavaScript במינון המדויק שצריך</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>השתמש ב-Claude Code כדי לכתוב קוד מהר פי כמה</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>
                      בחר את הכלי הנכון לכל פרויקט – Cursor, Bolt, v0 ועוד
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>בנה MVP אמיתי מאפס ועד דפלויי</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>
                      הבן את האבולוציה של AI agents ולאן הולך הפיתוח
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>
                      שלב AI בשגרת העבודה היומית שלך בצורה אפקטיבית
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>
                      קבל מסלול ברור להמשך הלמידה וצמיחה מקצועית
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <Image
                src="/course-assets/cover.png"
                width={600}
                height={400}
                alt="תצוגה מקדימה של קורס AI"
                className="rounded-xl border shadow-xl"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-10">
          <div className="flex flex-col items-center gap-2">
            <CourseCta
              isPurchased={isPurchased}
              onBuyClick={() => handleBuyButtonClick("features")}
            >
              <span>התחל עכשיו!</span>
              <ArrowLeft className="ml-2 h-4 w-4" />
            </CourseCta>
          </div>
        </div>
      </section>
    </main>
  );
}
