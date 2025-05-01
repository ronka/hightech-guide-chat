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
      <section className="w-full border-b bg-gradient-to-br from-purple-500/20 via-violet-400/20 to-blue-500/20">
        <div className="container px-4 md:px-6 py-12 md:py-24 lg:py-32">
          <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  מפצחים את קוד הראיון: המדריך המלא להצלחה בראיונות טכניים
                </h1>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  סודות המראיינים נחשפים: כשעתיים ממוקדות שיהפכו אותך ממועמד
                  רגיל למועמד המועדף
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>
                    גישה למעלה מ-25 שיעורי וידאו מעשיים עם דוגמאות אמיתיות
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>
                    מסלול אישי, ממוקד ומדויק של שעתיים - ללא בזבוז זמן על תוכן
                    מיותר
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>
                    הדרכה ממראיין בכיר עם +10 שנות ניסיון ואלפי ראיונות טכניים
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>
                    גישה לכל החיים + עדכונים חינמיים כשדרישות השוק משתנות
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>
                    חומרי תרגול מעשיים, טמפלייטים לקורות חיים ולינקדאין אופטימלי
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                <div className="flex flex-col items-center w-full gap-2">
                  <BuyButton size="xl">הזמינו את הקורס עכשיו ←</BuyButton>
                  <div className=" text-amber-200 font-medium rounded-full px-4 py-1 text-sm flex items-center gap-1 mb-2 animate-pulse">
                    🔥 40% הנחה למאה הרוכשים הבאים
                  </div>
                </div>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="relative w-full overflow-hidden rounded-xl border bg-background shadow-xl">
                <div className="flex items-center justify-between border-b px-4 py-2">
                  <div className="flex gap-1">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                </div>

                <div className="p-4 mt-4">
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
            <div className="rounded-xl border bg-card p-6 shadow-sm">
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
            <div className="rounded-xl border bg-card p-6 shadow-sm">
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
              <span className="text-amber-500 font-medium text-sm">
                ⏰ המבצע לזמן מוגבל בלבד
              </span>
              <BuyButton>
                <span>רוצה לחסוך חודשים של טעויות - קנה עכשיו</span>
                <ArrowLeft className="ml-2 h-4 w-4" />
              </BuyButton>
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
            <span className="text-amber-500 font-medium text-sm">
              ⏰ 40% הנחה - הצעה מוגבלת
            </span>
            <BuyButton>
              <span>אני רוצה ללמוד ולהצליח!</span>
              <ArrowLeft className="ml-2 h-4 w-4" />
            </BuyButton>
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
            <span className="text-amber-500 font-medium text-sm">
              🔥 40% הנחה + חומרי בונוס
            </span>
            <BuyButton>
              <span>התחל עכשיו ב-198 ₪ בלבד!</span>
              <ArrowLeft className="ml-2 h-4 w-4" />
            </BuyButton>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {/* <section
        id="testimonials"
        className="w-full py-12 md:py-24 lg:py-32 bg-muted"
      >
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
          <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-muted h-10 w-10"></div>
                <div>
                  <h3 className="font-bold">אלכס צ'ן</h3>
                  <p className="text-sm text-muted-foreground">
                    מהנדס תוכנה בגוגל
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm">
                  "זה משאב ההכנה לראיונות הטוב ביותר שאי פעם השתמשתי בו. אחרי
                  שנכשלתי בראיונות מרובים בגוגל, עברתי את המערכת הזו וקיבלתי
                  הצעה עם שכר גבוה ב-$50K מהעבודה הקודמת שלי."
                </p>
              </div>
              <div className="mt-4 flex text-yellow-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-muted h-10 w-10"></div>
                <div>
                  <h3 className="font-bold">שרה ג'ונסון</h3>
                  <p className="text-sm text-muted-foreground">
                    מפתחת בכירה במיקרוסופט
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm">
                  "חלק עיצוב המערכות לבד היה שווה את המחיר. נאבקתי עם הראיונות
                  האלה במשך חודשים, אבל אחרי שעברתי את הקורס הזה, הצלחתי להסביר
                  בביטחון את הגישה שלי וקיבלתי מספר הצעות."
                </p>
              </div>
              <div className="mt-4 flex text-yellow-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section> */}
    </main>
  );
}
