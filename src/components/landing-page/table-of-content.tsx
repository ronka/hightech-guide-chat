"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/services/utils";
import { Badge } from "../ui/badge";
import { RonkaDigitalBookButton } from "./buttons";
import { RonkaPhysicalBookButton } from "./buttons";

interface Chapter {
  title: string;
  preview?: string;
}

const chapters: Chapter[] = [
  {
    title:
      "פרק 1: איך סיימתי תואר במדעי המחשב תוך כדי עבודה במשרה מלאה בשלוש וחצי שנים",
    preview: `# איך סיימתי תואר במדעי המחשב תוך כדי עבודה במשרה מלאה בשלוש וחצי שנים
	  
את העבודה הראשונה שלי מצאתי לגמרי במקרה תוך כדי שאני מחכה לציון פסיכומטרי כדי לראות איפה אני הולך ללמוד. בחור בשם אדיר מ-Interjet חיפש עובדים ובחר לתת לי הזדמנות כג'וניור עם תיק עבודות מצומצם שכלל בלוג גיימינג, חנות אינטרנטית שבניתי לאבא שלי ועוד כמה תבניות CSS HTML שבניתי וניסיתי למכור במרקטפלייס של ThemeForest. הייתי מרוצה מאוד מהעבודה ולכן בכל פעם שחשבתי על ללכת ללמוד חששתי מכיוון שלא רציתי לקחת צעד אחורה להפסיק לעבוד וללכת להתחיל לימודים, ואז שוב לחפש עבודה בתחום.

ואז גיליתי את האוניברסיטה הפתוחה, מפה לשם התחלתי ללמוד בה. התחלתי מקורס אחד בסמסטר קיץ, עברתי ל-2 קורסים בסמסטר רגיל ואז הרגשתי בנוח והמשכתי את כל התואר עם 3 קורסים בסמסטר רגיל ו-2 בקיץ. קצב זה איפשר לי לסיים את התואר ב-11 סמסטרים, שהתפרסו על 3 שנים ו-8 חודשים עם סמסטר אחד שלקחתי חופש וטסתי למזרח לנקות קצת את הראש. 

עם הזמן למדתי המון שיטות ודרכים כיצד לנהל את הזמן שלי בצורה יעילה וללמוד נכון. דברים שעזרו לי המון כדי להנות גם בתקופה עם כל כך הרבה דברים על הראש. במאמר הזה הייתי רוצה לשתף אתכם בהם, כיצד לנהל את הזמן, איך ללמוד כאשר אין מישהו שעומד על הראש, תוכנית הלימודים שלי, ובאילו כלים השתמשתי כדי להקל על חיי. `,
  },
  { title: "פרק 2: דברים שהייתי רוצה לדעת לפני שהתחלתי לעבוד בהייטק" },
  { title: "פרק 3: קורות חיים, ראיונות עבודה ומה שביניהם" },
  {
    title: "פרק 4: דברים שהייתי רוצה לדעת לפני שהתחלתי לתכנת",
    preview: `# לקח לי שבוע לפתור באג

## Expected Behavior
במסגרת אחת המשימות שכתבתי לה טסטים החלטתי לטפל בבעיית האנימציות שיש לנו בסביבת הבדיקות E2E. אין היגיון בטסט לחכות שהאנימציה תסתיים מכיוון שזה הוא אלמנט קוסמטי בלבד שאינו משפיע על הלוגיקה של האפליקציה והזמן הזה של כל האנימציות הוא זמן חשוב מכיוון שהוא כל שניה של אנימציה חוסמת אותי מלדחוף את הקוד ולהמשיך האלה. לכן הוחלט בסביבת בדיקות אנחנו לא מריצים אנימציות והמשימה הייתה ״לכבות״ את כל האנימציות ככה שכל המעברים יהיו מיידים אבל לשמור על האנימציות בפרודקשן וכל זה מבלי שהקוד ידע על איזה סביבה הוא רץ.

## Steps To Reproduce
ישנו קובץ config אשר משתנה עבור כל סביבה, הרעיון היה להוסיף משתנה בוליאני(דגל) לאותו config כך בהתאם לסביבה נוכל לכבות ולהדליק אנימציות. בעזרת זה בבדיקות E2E נכבה את האנימציות ובכך נוכל לחסוך זמן ונפשט בטסטים את הקוד(חוסך המתנה שהאנימציה תיגמר והופך את הקוד ליותר דטרמיניסטי וקריא).

הפרויקט נבנה באמצעות Webpack ואת הבדיקות E2E אנחנו מבצעים באמצעות Jest ו-Puppeteer. ה-Webpack הוא זה שדואג להגדיר משתני סביבה וככה בעצם הקוד יודע באיזה קובץ config הוא צריך להשתמש, בגלל שה-Jest לא משתמש ב-Webpack היינו צריכים דרך אחרת לטעון config של סביבת בדיקות ולכן באמצעות moduleNameMapper(אחד מהמשתני config של Jest) אמרנו ל-Jest בכל פעם שאתה עושה import לconfig תביא במקום זה את ה-config לסביבת בדיקות. זה האקדח במערכה הראשונה תאכלס.

הדגל החדש עבד ואכן כשהוא היה דלוק האנימציות לא רצו אבל משום מה שכאשר הרצתי את סביבת הבדיקות E2E האנימציות היו רצות בכל זאת, זה היה נראה כאילו לא השתמשנו בקובץ config הנכון. למה??.....`,
  },
  { title: "פרק 5: מבית תוכנה עד לגוגל, ההבדלים בין חברות בסדרי גודל שונים" },
  { title: "פרק 6: ניהול משימות" },
  {
    title: "פרק 7: הכנה לראיונות הטכניים",
    preview: `# איך LeetCode עזר לי בפיתוח פיצ'ר בעבודה 
לאחרונה עשיתי סבב ראיונות, כחלק מההכנות לראיונות חרשתי את LeetCode עם בעיות של אלגוריתמים ומבני נתונים. מנטרה שאני רואה שחוזרת הרבה אומרת: "למה בודקים אותנו על שאלות מהתואר שלנו במדעי המחשב?", בטענה שזה לא בעיות שמשקפות Use cases אמיתיים. אז הנה סתם דוגמא למקרה אשר בו צורת המחשבה אשר יוצרות שאלות מסוג זה עוזרת בפתירת בעיות יומיומיות.

במקרה כאשר הייתי בשיא ההכנות, כאשר אני כבר שורק מבני נתונים ומדקלם רקורסיות, קיבלתי משימה בעבודה להוסיף שדה פילטר/חיפוש חדש לאזור של החיפוש המתקדם באפליקציה, המסודר בעזרת הGrid System של Bootstrap. ההוראות של המעצבת היו פשוטות: לכל היותר 4 פילטרים בשורה ולכל הפחות 2 פילטרים בשורה. זאת אומרת שלא יתכן מצב שיהיו לי כמה פילטרים בשורה ופילטר בודד בשורה בשל עצמו.

## "מה הקשר רקורסיה?"
נשמע משימה פשוטה סה"כ אבל הסיפור הסתבך כאשר בדיילי התברר שגם אני וגם שני חברי צוות אחרים דיווחנו על הוספת פילטרים לאותו איזור הזה, כאשר לכל פילטר יש איזשהו ביזנס לוג'יק שמחליט אם להציג אותו. כעת מספר העמודות בGrid שכל פילטר מקבל הוא בעצם תלוי בכמה פילטרים צריך להציג. הדרך הנאיבית הייתה שכל אחד ידאג לעצמו, כל אחד ידאג להוסיף לעדכן את התנאים שמחליטים כמה עמודות תופס כל פילטר כאשר הוא לוקח בחשבון את כל הפילטרים שכבר קיימים עם התנאים שלהם. אמנם הייתה הנחה מקלה שלא יהיו יותר מ8 פילטרים ותמיד יהיו יותר מ2, עדין היו המון קומבינציות לאיזה פילטרים יכולים להופיע.

היינו חייבים לפתור את זה בדרך טיפה יותר מתוחכמת, קומפוננטה אחת שתדע להתמודד עם כמה פילטרים שלא יתנו לה ותדע לסדר אותם באופן חכם בGrid System שלנו לפי המגבלות של המעצבת. בגלל שהייתי כבר משופשף בשאלות של ראיונות אמרתי בוא ננסה לעשות את זה באמצעות רקורסיה כי למה לא? .....`,
  },
  { title: "פרק 8: הכנה לראיונות אישיים" },
  { title: "פרק 9: סיכום מסע" },
];

export default function TableOfContents() {
  const [openPreview, setOpenPreview] = useState<string | null>(null);

  const togglePreview = (chapterTitle: string) => {
    setOpenPreview((prev) => (prev === chapterTitle ? null : chapterTitle));
  };

  return (
    <div className="container px-4 md:px-6">
      <h2 className="text-3xl font-bold tracking-tighter text-center mb-8 sm:text-4xl md:text-5xl">
        תוכן הספר 📖
      </h2>
      <div className="max-w-3xl mx-auto space-y-4">
        {chapters.map((chapter, index) => (
          <div
            key={index}
            className={cn(
              "border rounded-lg overflow-hidden",
              chapter.preview && "cursor-pointer"
            )}
            onClick={() => chapter.preview && togglePreview(chapter.title)}
          >
            <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-700">
              <h3 className="text-lg font-semibold">
                {chapter.title}
                {chapter.preview && (
                  <Badge className="mr-4 text-xs">הצצה לפרק</Badge>
                )}
              </h3>
              {chapter.preview && (
                <Button
                  variant="ghost"
                  size="sm"
                  aria-expanded={openPreview === chapter.title}
                  aria-controls={`preview-${index}`}
                >
                  {openPreview === chapter.title ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}

                  <span className="sr-only">
                    {openPreview === chapter.title ? "Hide" : "Show"} הצצה לפרק
                  </span>
                </Button>
              )}
            </div>
            {chapter.preview && (
              <div
                id={`preview-${index}`}
                className={`bg-gray-50 dark:bg-gray-600 p-4 ${
                  openPreview === chapter.title ? "block" : "hidden"
                }`}
              >
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-xl font-bold mb-2 mt-4">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-semibold mb-2 mt-3">
                        {children}
                      </h2>
                    ),
                    p: ({ children }) => (
                      <p className="mb-2 leading-relaxed">{children}</p>
                    ),
                  }}
                  className={cn(
                    "bg-gray-100 dark:bg-gray-800 p-4 rounded-md",
                    "border-l-4 border-gray-300 dark:border-gray-600",
                    "text-gray-700 dark:text-gray-300 "
                  )}
                >
                  {chapter.preview}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}

        <div>
          <h3 className="text-xl font-semibold text-center mb-10">
            רוצים לקרוא את הספר? הזמינו עכשיו!
          </h3>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <RonkaPhysicalBookButton />
            <RonkaDigitalBookButton />
          </div>
        </div>
      </div>
    </div>
  );
}
