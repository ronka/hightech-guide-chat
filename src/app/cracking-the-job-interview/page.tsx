import Image from "next/image";
import Link from "next/link";
import { Check, ArrowLeft } from "lucide-react";
import GoogleLogo from "@/components/logos/google.svg";
import MicrosoftLogo from "@/components/logos/microsoft.svg";
import JfrogLogo from "@/components/logos/jfrog.svg";
import DropboxLogo from "@/components/logos/dropbox.svg";
import WscLogo from "@/components/logos/wsc.svg";
import { Metadata } from "next";
import { About } from "@/components/landing-page/about";

// Import feedback images
import feedback1 from "./feedbacks/feedback1.jpg";
import feedback2 from "./feedbacks/feedback2.jpg";
import feedback3 from "./feedbacks/feedback3.jpg";
import feedback4 from "./feedbacks/feedback4.png";
import feedback5 from "./feedbacks/feedback5.png";

export const metadata: Metadata = {
  title: "מפצחים את קוד הראיון: המדריך המלא להצלחה בראיונות טכניים",
  description:
    "הקורס היחיד שהופך את תהליך הראיונות ממפחיד למנצח. שעתיים ממוקדות שיעניקו לך את הכלים להתקבל לתפקיד שאתה רוצה.",
  openGraph: {
    title: "מפצחים את קוד הראיון: המדריך המלא להצלחה בראיונות טכניים",
    description:
      "הקורס היחיד שהופך את תהליך הראיונות ממפחיד למנצח. שעתיים ממוקדות שיעניקו לך את הכלים להתקבל לתפקיד שאתה רוצה.",
    type: "website",
    locale: "he_IL",
    siteName: "המדריך להייטקיסט המתחיל",
    images: [
      {
        url: "https://ronka.dev/wp-content/uploads/2025/04/malben-2.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "מפצחים את קוד הראיון: המדריך המלא להצלחה בראיונות טכניים",
    description:
      "הקורס היחיד שהופך את תהליך הראיונות ממפחיד למנצח. שעתיים ממוקדות שיעניקו לך את הכלים להתקבל לתפקיד שאתה רוצה.",
    images: ["https://ronka.dev/wp-content/uploads/2025/04/malben-2.png"],
  },
};

interface BuyButtonProps {
  children: React.ReactNode;
  href?: string;
  size?: "default" | "xl";
}

const BuyButton = ({
  children,
  href = "https://ronka.dev/qcwz",
  size = "default",
}: BuyButtonProps) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-base font-medium text-white shadow-lg transition-all duration-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-xl hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 hover:animate-none relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent";

  const sizeClasses = size === "xl" ? "h-16 px-12 text-lg" : "h-12 px-8";

  return (
    <Link href={href} className={`${baseClasses} ${sizeClasses}`}>
      {children}
    </Link>
  );
};

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="w-full border-b text-gray-200">
        <div className="container px-4 md:px-6 py-12 md:py-24 lg:py-32">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="text-sm text-muted-foreground mb-4">
              ⭐️ מועבר ע"י מראיין בכיר עם +10 שנות ניסיון
            </div>
            <div className="absolute inset-0 -z-10">
              <Image
                src="/book-assets/background.png"
                alt="Background"
                layout="fill"
                objectFit="cover"
                className="opacity-10 dark:opacity-10 not-sr-only"
              />
            </div>

            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              לכבוש את הראיון: המדריך למשרת הפיתוח הבאה שלך
            </h1>

            <p className="text-lg font-medium text-green-400">
              מקפצה לקריירה שלך בהייטק
            </p>

            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              קורס וידאו מקיף עם +25 שיעורים מעשיים וליווי של מראיין בכיר. קבלו
              את הכלים לכבוש את ראיון העבודה ולהתקבל למשרת הפיתוח הראשונה שלכם.
            </p>

            <div className="flex flex-col items-center w-full gap-3 pt-4">
              <BuyButton size="xl">הזמינו את הקורס עכשיו ←</BuyButton>
              <div className=" text-amber-300 font-medium text-sm flex items-center gap-1 animate-pulse">
                🔥 40% הנחה למאה הרוכשים הבאים
              </div>
            </div>

            <div className="relative mt-8 flex w-full max-w-3xl items-center justify-center">
              <div className="relative w-full overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-xl">
                <div className="flex items-center gap-4 border-b border-gray-700 px-4 py-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-sm font-medium text-gray-300">
                    [הצצה] 1.0 - שלום וברוכים הבאים
                  </div>
                </div>
                <div className="p-4">
                  <div
                    className="relative w-full"
                    style={{ paddingBottom: "56.25%" }}
                  >
                    <iframe
                      src="https://www.youtube.com/embed/w86FMn_9eZY?showinfo=0"
                      className="absolute top-0 left-0 w-full h-full rounded-md"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Logos Section */}
      <section className="w-full py-8 border-b">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              בוגרי הקורס עובדים בחברות המובילות בעולם
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
              <div className="flex items-center justify-center">
                <Image
                  src={GoogleLogo}
                  alt="גוגל"
                  width={120}
                  height={60}
                  className="h-8 w-auto opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                />
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src={MicrosoftLogo}
                  alt="מיקרוסופט"
                  width={120}
                  height={60}
                  className="h-8 w-auto opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                />
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src={JfrogLogo}
                  alt="Jfrog"
                  width={120}
                  height={60}
                  className="h-8 w-auto opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                />
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src={DropboxLogo}
                  alt="דרופבוקס"
                  width={120}
                  height={60}
                  className="h-8 w-auto opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                />
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src={WscLogo}
                  alt="WSC"
                  width={120}
                  height={60}
                  className="h-8 w-auto opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                />
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
                למה להמשיך להיכשל כשאפשר ללמוד מהטעויות של אחרים?
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                הפסק לבזבז חודשים על ניסוי וטעייה - קבל גישה לידע שיקצר לך את
                הדרך בשבועות
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-2">
            <div className="rounded-xl card rounded-box bg-base-100  border border-red-300 bg-red-950/10 p-6 shadow-sm ">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">😩</span>
                <h3 className="text-xl font-bold text-rose-500">
                  בלי הקורס: נפילה חופשית
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>חודשים של חיפוש עבודה ללא תוצאות</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>כישלון אחרי כישלון בראיונות טכניים</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>קורות חיים שנזרקים לפח ללא מענה</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>תחושת תסכול וחוסר ביטחון מקצועי</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>בזבוז זמן יקר על משאבים מפוזרים</span>
                </li>
              </ul>
            </div>
            <div className="rounded-xl p-6 shadow-sm card rounded-box  bg-base-100  border border-green-300 bg-green-950/10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">😎</span>
                <h3 className="text-xl font-bold text-green-500">
                  עם הקורס: מסלול מהיר להצלחה
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-green-500"></span>
                  <span>מראיינים פונים אליך עם הצעות עבודה</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-green-500"></span>
                  <span>פרופיל לינקדאין שמושך מגייסים בכירים</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-green-500"></span>
                  <span>ביטחון מלא בכל חלקי הראיון הטכני</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-green-500"></span>
                  <span>יכולת לנווט את הריאיון ולהוביל אותו</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-green-500"></span>
                  <span>קיצור משמעותי של זמן חיפוש העבודה</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-2">
              <BuyButton>
                <span>רוצה לחסוך חודשים של טעויות - קנה עכשיו</span>
                <ArrowLeft className="ml-2 h-4 w-4" />
              </BuyButton>
              <span className="text-amber-500 font-medium text-sm">
                ⏰ המבצע לזמן מוגבל בלבד
              </span>
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
                תוכנית לימודים מקיפה שנועדה לקחת אותך מההכנה ועד להצעת העבודה
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 py-12">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-bold">1. מבוא לתהליך הגיוס</h3>
              <p className="mt-2 text-muted-foreground">
                הבנה מעמיקה של תהליך הגיוס בהייטק, שלבים מרכזיים ומה מצפים ממך
                בכל שלב.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-bold">2. כתיבת קורות חיים מנצחים</h3>
              <p className="mt-2 text-muted-foreground">
                איך לכתוב קורות חיים שיבלטו מעל כולם ויעברו את הסינון הראשוני.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-bold">
                3. בניית פרופיל לינקדין אפקטיבי
              </h3>
              <p className="mt-2 text-muted-foreground">
                איך לבנות פרופיל לינקדין שימשוך את תשומת הלב של מגייסים ומנהלי
                גיוס.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-bold">4. הכנה לראיונות טכניים</h3>
              <p className="mt-2 text-muted-foreground">
                איך להתכונן לראיונות קוד, מבני נתונים ואלגוריתמים בצורה
                אפקטיבית.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-bold">5. ראיונות עיצוב מערכות</h3>
              <p className="mt-2 text-muted-foreground">
                איך להתכונן לראיונות System Design ולהציג את היכולות שלך בעיצוב
                מערכות.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-bold">
                6. ראיונות התנהגותיים ואישיים
              </h3>
              <p className="mt-2 text-muted-foreground">
                איך להתכונן לשאלות אישיות והתנהגותיות ולענות עליהן בצורה משכנעת.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-bold">7. הצעדים הבאים</h3>
              <p className="mt-2 text-muted-foreground">
                איך להמשיך מהקורס הלאה, לשפר את היכולות שלך ולהתקדם בקריירה.
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <BuyButton>
              <span>אני רוצה ללמוד ולהצליח!</span>
              <ArrowLeft className="ml-2 h-4 w-4" />
            </BuyButton>
            <span className="text-amber-500 font-medium text-sm">
              ⏰ 40% הנחה - הצעה מוגבלת
            </span>
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
                תפסיקו לנחש. קבלו את הכלים להצליח בראיונות טכניים.
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                מעבר לתיאוריה: זו מערכת שלמה, צעד-אחר-צעד, המבוססת על ניסיון
                מעשי ומובילה לתוצאות מוכחות בשטח.
              </p>
              <div className="space-y-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>הבן איך מגייסים חושבים והשתמש בזה לטובתך</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>צור קורות חיים מנצחים שיבלטו מתוך מאות מועמדים</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>
                      פצח את הקוד של ראיונות טכניים - תקשורת, Big-O וקוד איכותי
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>
                      שלוט בLeetCode בקלות עם מתודולוגיה מוכחת לפתרון בעיות
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>הפגן ידע בעיצוב מערכות גם אם אין לך ניסיון קודם</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>
                      בנה נרטיב אישי שישכנע כל מראיין לרצות לעבוד איתך
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>
                      להתמודד עם שאלות התנהגותיות ולדעת מה לשאול את המראיינים
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>
                      לקבל טיפים מעשיים מכל שלב בגיוס ועד לחתימת החוזה
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
                alt="תצוגה מקדימה של הקורס"
                className="rounded-xl border shadow-xl"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-10">
          <div className="flex flex-col items-center gap-2">
            <BuyButton>
              <span>התחל עכשיו ב-198 ₪ בלבד!</span>
              <ArrowLeft className="ml-2 h-4 w-4" />
            </BuyButton>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                סיפורי הצלחה מהסטודנטים שלנו
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                הצטרף לאלפי מפתחים שהפכו את הקריירה שלהם
              </p>
            </div>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-2 gap-4 max-w-5xl mx-auto ">
              <Image
                src={feedback1}
                alt="משוב מתלמיד על הקורס - הצלחתי בראיון טכני"
                className="w-full object-contain transition-transform duration-300 hover:scale-[1.2]"
                width={479}
                height={211}
              />
              <Image
                src={feedback2}
                alt="משוב חיובי על התכנית - קיבלתי הצעת עבודה"
                className="w-full object-contain transition-transform duration-300 hover:scale-[1.2]"
                width={442}
                height={145}
              />
              <Image
                src={feedback3}
                alt="חוויה חיובית מהקורס - משוב תלמיד"
                className="w-full object-contain transition-transform duration-300 hover:scale-[1.2]"
                width={614}
                height={166}
              />
              <Image
                src={feedback4}
                alt="משוב על שיפור בראיונות טכניים - הצלחה"
                className="w-full object-contain transition-transform duration-300 hover:scale-[1.2]"
                width={470}
                height={135}
              />
              <Image
                src={feedback5}
                alt="תוצאות חיוביות אחרי הקורס - משוב תלמיד"
                className="w-full object-contain transition-transform duration-300 hover:scale-[1.2]"
                width={466}
                height={147}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
