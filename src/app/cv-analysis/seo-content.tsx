import React from "react";

const steps = [
  {
    n: "1",
    title: "העלו את קובץ קורות החיים",
    body: "קובץ PDF, עד 10MB. בלי הרשמה ובלי כרטיס אשראי.",
  },
  {
    n: "2",
    title: "קבלו ניתוח מקיף",
    body: "ציון ATS, קריאות ומילות מפתח — אותן בדיקות שמערכת הגיוס מריצה על הקובץ שלכם.",
  },
  {
    n: "3",
    title: "בצעו שינויים בהתאם להמלצות",
    body: "רשימת תיקונים מעשית לסימון, שמגדילה את סיכויי הקבלה שלכם.",
  },
];

const checks = [
  {
    title: "בדיקת התאמה ל-ATS",
    body: "ודאו שקורות החיים שלכם עוברים את שלב הסינון האוטומטי ומגיעים לעיני מגייס.",
  },
  {
    title: "ניתוח פורמט וקריאות",
    body: "שיפור מבנה הקובץ, האורך, העקביות ונגישות התוכן.",
  },
  {
    title: "דירוג חכם של הקובץ",
    body: "ציון התאמה למשרות שאתם באמת רוצים, מול תיאור המשרה שתדביקו.",
  },
  {
    title: "הצעות לשיפור",
    body: "טיפים מעשיים וקונקרטיים לשיפור קובץ קורות החיים — לא המלצות כלליות.",
  },
];

export function SeoContent() {
  return (
    <div className="text-start">
      <section className="container max-w-3xl px-4 pb-4">
        <p className="text-lg text-muted-foreground">
          האם קורות החיים שלכם מותאמים למערכות סינון אוטומטיות? רוב המעסיקים
          היום משתמשים במערכות ATS (Applicant Tracking System) לסינון מועמדים.
          אם קובץ קורות החיים שלכם לא מותאם – הוא עלול להיפסל אוטומטית, לפני
          שאדם בכלל פתח אותו.
        </p>
      </section>

      <section className="container max-w-4xl px-4 py-16">
        <h2 className="text-2xl font-bold">איך זה עובד?</h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.n}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-lg font-bold text-slate-200">
                {step.n}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container max-w-4xl px-4 pb-16">
        <h2 className="text-2xl font-bold">
          שירות ניתוח קורות חיים מתקדם – מה תקבלו?
        </h2>
        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2">
          {checks.map((check) => (
            <div key={check.title} className="bg-background p-6">
              <h3 className="font-semibold">{check.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{check.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container max-w-3xl px-4 pb-20 text-center">
        <p className="text-xl font-bold">
          אל תפספסו הזדמנויות עבודה – תנו לקורות החיים שלכם יתרון תחרותי.
        </p>
        <p className="mt-2 text-muted-foreground">
          העלו עכשיו את קובץ קורות החיים וקבלו ניתוח מיידי.
        </p>
      </section>
    </div>
  );
}
