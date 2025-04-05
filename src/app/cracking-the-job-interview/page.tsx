import Image from "next/image";
import Link from "next/link";
import { Check, ArrowLeft } from "lucide-react";
import GoogleLogo from "@/components/logos/google.svg";
import MicrosoftLogo from "@/components/logos/microsoft.svg";
import JfrogLogo from "@/components/logos/jfrog.svg";
import DropboxLogo from "@/components/logos/dropbox.svg";
import WscLogo from "@/components/logos/wsc.svg";

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
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  כובשים את שוק העבודה: קורס הכנה מקיף למפתחים
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  רוצים להיכנס לעולם ההייטק ולהתקבל למשרת פיתוח ראשונה? הקורס
                  &quot;לצלוח את ראיון העבודה הבא שלך&quot; נבנה במיוחד עבורכם!
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>להבין לעומק את תהליך הגיוס ואיך מגייסים חושבים</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>
                    לכתוב קורות חיים מנצחים שיעזרו לכם לבלוט מבין המועמדים
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>
                    להתכונן לראיונות טכניים, כולל תקשורת אפקטיבית, Big-O ומבני
                    נתונים
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>
                    לשלוט בLeetCode ובאתרי תרגול נוספים לשיפור יכולות הקידוד
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>
                    להתכונן לראיונות עיצוב מערכות ולהבין את העקרונות שמראיינים
                    מחפשים
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>לבנות נרטיב אישי חזק שיעזור לכם בראיונות האישיים</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>
                    להתמודד עם שאלות התנהגותיות ולדעת מה לשאול את המראיינים
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>לקבל טיפים מעשיים מכל שלב בגיוס ועד לחתימת החוזה</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                <BuyButton size="xl">
                  קבל גישה ב-198 ₪{" "}
                  <span className="line-through text-gray-300">299 ₪</span>
                </BuyButton>

                {/* <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    3,500+ עותקים נמכרו כבר
                  </span>
                </div> */}
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
              תלמידים שעברו את הקורס עובדים כיום בחברות מובילות כמו{" "}
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
                הקורס המקיף הראשון בישראל להצלחה בראיונות טכניים
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                הפסק לבזבז זמן עם סרטוני יוטיוב אקראיים ומשאבים מפוזרים
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">😩</span>
                <h3 className="text-xl font-bold text-rose-500">
                  ללא הכנה מקצועית
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>לא יודעים לענות על שאלות</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>מבזבז חודשים להבין איך להתכונן לראיון</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>נכשל במלא ראיונות עבודה</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>לא עובר סינון ראשוני</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>חוסר ביטחון בתהליך הגיוס</span>
                </li>
              </ul>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">😎</span>
                <h3 className="text-xl font-bold text-green-500">
                  עם הקורס המקיף
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-green-500"></span>
                  <span>חוזרים אליו בכל משרה</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-green-500"></span>
                  <span>פונים אליו בלינקדאין מגייסים</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-green-500"></span>
                  <span>עונה על שאלות LeetCode בקלות</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-green-500"></span>
                  <span>יודע לבנות נרטיב ולשווק את עצמו</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-green-500"></span>
                  <span>ניגש לראיון עבודה עם ביטחון</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex justify-center">
            <BuyButton>
              <span>אני רוצה להצליח בראיון הבא שלי!</span>
              <ArrowLeft className="ml-2 h-4 w-4" />
            </BuyButton>
          </div>
        </div>
      </section>

      {/* What You Will Learn Section */}
      <section id="learn" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
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
          <BuyButton>
            <span>אני רוצה ללמוד ולהצליח!</span>
            <ArrowLeft className="ml-2 h-4 w-4" />
          </BuyButton>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="w-full py-12 md:py-24 lg:py-32 bg-background"
      >
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 px-10 md:gap-16 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                חבילה מלאה
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                כל מה שאתה צריך כדי להצליח בראיונות טכנולוגיים
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                זה לא סתם עוד קורס עם תיאוריה בסיסית. זו מערכת שלמה עם תוצאות
                מוכחות.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>יותר מ-25 שיעורי וידאו מקצועיים</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>קבצי תרגול מעשיים</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>יותר מ-1.5 שעות של תוכן איכותי</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>מועבר על ידי מראיין אמיתי עם ניסיון</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>גישה לכל החיים</span>
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
          <BuyButton>
            <span>לגישה מלאה לקורס! </span>
            <ArrowLeft className="ml-2 h-4 w-4" />
          </BuyButton>
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
