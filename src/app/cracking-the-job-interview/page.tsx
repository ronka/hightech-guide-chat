import Image from "next/image";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import GoogleLogo from "@/components/logos/google.svg";
import MicrosoftLogo from "@/components/logos/microsoft.svg";
import MetaLogo from "@/components/logos/meta.svg";
import DropboxLogo from "@/components/logos/dropbox.svg";
import WscLogo from "@/components/logos/wsc.svg";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="w-full border-b bg-gradient-to-br from-purple-500/20 via-violet-400/20 to-blue-500/20">
        <div className="container px-4 md:px-6 py-12 md:py-24 lg:py-32">
          <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  לא הולך בראיונות העבודה? לא יודעים איך לכתוב קורות חיים?
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  רוצים להיכנס לעולם ההייטק ולהתקבל למשרת פיתוח ראשונה? הקורס
                  <strong> "לצלוח את ראיון העבודה הבא שלך"</strong> נבנה במיוחד
                  עבורכם!
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
                <Link
                  href="#buy"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-8 text-base font-medium text-white shadow-lg transition-all duration-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-xl hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 hover:animate-none relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent"
                >
                  קבל גישה ב-198 ₪
                </Link>
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
                  src={MetaLogo}
                  alt="מטא"
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
                המערכת הראשונה המלאה להצלחה בראיונות קוד
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
                  ללא Cracking the Code Interview
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>אין גישה מובנית להכנה לראיונות</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>בזבוז חודשים בניסיון להבין מה ללמוד לבד</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>כישלון בראיונות מרובים לפני שמבינים מה עובד</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>אין מושג למה הצלחת כשזה קורה</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>החמצת $10K-$50K בשכר פוטנציאלי</span>
                </li>
              </ul>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">😎</span>
                <h3 className="text-xl font-bold text-green-500">
                  עם Cracking the Code Interview
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-green-500"></span>
                  <span>מערכת צעד אחר צעד שהוכחה כעובדת בחברות מובילות</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-green-500"></span>
                  <span>הכנה יעילה עם תוכנית ממוקדת של 6 שבועות</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-green-500"></span>
                  <span>שליטה בדפוסים המדויקים שמופיעים בראיונות אמיתיים</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-green-500"></span>
                  <span>רכישת ביטחון עם מסגרות מוכחות לכל בעיה</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-green-500"></span>
                  <span>משא ומתן להצעות גבוהות יותר עם טכניקות פנימיות</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex justify-center">
            <Link
              href="#buy"
              className="inline-flex h-12 items-center justify-center rounded-md bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-8 text-base font-medium text-white shadow-lg transition-all duration-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-xl hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 animate-pulse hover:animate-none relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent"
            >
              <span>קבל את המערכת המלאה</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* What You Will Learn Section */}
      <section id="learn" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                מה תלמד
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                תוכנית לימודים מקיפה שנועדה לקחת אותך מההכנה ועד להצעת העבודה
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 py-12">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-bold">
                1. יסודות מבני נתונים ואלגוריתמים
              </h3>
              <p className="mt-2 text-muted-foreground">
                שליטה במבני הנתונים והאלגוריתמים הבסיסיים שיוצרים את הבסיס
                לראיונות קוד.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-bold">2. מסגרות לפתרון בעיות</h3>
              <p className="mt-2 text-muted-foreground">
                למד גישות שיטתיות לפרק ולפתור כל בעיית קוד שתפגוש.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-bold">3. ראיונות עיצוב מערכות</h3>
              <p className="mt-2 text-muted-foreground">
                פיתוח היכולות לעצב מערכות מדרגיות ולהסביר את החלטות העיצוב שלך.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-bold">4. הכנה לראיונות התנהגותיים</h3>
              <p className="mt-2 text-muted-foreground">
                יצירת סיפורים משכנעים שמציגים את הניסיון והכישורים הרכים שלך
                ביעילות.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-bold">5. ראיונות סימולציה ומשוב</h3>
              <p className="mt-2 text-muted-foreground">
                תרגול עם תרחישי ראיונות מציאותיים וקבלת משוב מפורט לשיפור.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-bold">6. טקטיקות למשא ומתן על שכר</h3>
              <p className="mt-2 text-muted-foreground">
                למד אסטרטגיות מוכחות למשא ומתן על חבילת הפיצויים הטובה ביותר.
              </p>
            </div>
          </div>
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
                  <span>50+ שיעורי וידאו המכסים את כל סוגי הראיונות</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>100+ בעיות תרגול עם פתרונות מפורטים</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>קהילה פרטית לתמיכה ורשתות קשרים</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>רשימת בדיקה ותזמון להכנה לראיונות</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>גישה לכל החיים ועדכונים עתידיים</span>
                </div>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <Image
                src="/placeholder.svg?height=400&width=600"
                width={600}
                height={400}
                alt="תצוגה מקדימה של הקורס"
                className="rounded-xl border shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
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
      </section>
    </main>
  );
}
