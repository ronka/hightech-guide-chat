import { Quote } from "lucide-react";
import { RonkaPhysicalBookButton } from "./buttons";
import { RonkaDigitalBookButton } from "./buttons";

const QuoteIcon = ({ children }: { children: any }) => {
  const colors = [
    "#55efc4",
    "#74b9ff",
    "#a29bfe",
    "#fd79a8",
    "#ffeaa7",
    "#fab1a0",
    "#e17055",
  ];

  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const bgColor = getRandomColor();

  return (
    <div
      className="rounded-full w-8 h-8 flex items-center justify-center text-2xl"
      style={{ backgroundColor: bgColor }}
    >
      {children}
    </div>
  );
};

const Quotes = () => {
  return (
    <div className="container px-4 md:px-6">
      <h2 className="text-3xl font-bold tracking-tighter text-center mb-8 sm:text-5xl">
        אנשים שקראו אומרים
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <iframe
          src="https://www.linkedin.com/embed/feed/update/urn:li:share:7240776756800962560"
          className="w-full aspect-[2/3] "
          title="Embedded post"
        />
        <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
          <Quote className="h-8 w-8 text-gray-400" />
          <p className="text-lg font-medium">
            הספר ״המדריך להייטקיסט המתחיל״ של רון קנטור כתוב בצורה רהוטה, שנונה
            ומרתקת כך שאתה לא יכול להפסיק לקרוא! הספר נתן לי המון השראה
            ומוטיבציה ללכת אחרי החלומות שלי, כי השמיים הם הגבול. חשוב לציין
            שהספר כולל מידע עבור אנשים שלומדים תואר, אנשים שמחפשים עבודה ואנשים
            שכבר נמצאים בעבודה, לכן בהחלט אחזור לספר הזה בעבודה הבאה שלי. מומלץ
            בחום!
          </p>
          <div className="flex items-center gap-4">
            <QuoteIcon>👨‍💻</QuoteIcon>

            <p className="text-sm text-gray-500">
              - עומר, בוגר טכניון, מחפש משרה שניה
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
          <Quote className="h-8 w-8 text-gray-400" />
          <p className="text-lg font-medium">
            הספר מציג תמונה מאוזנת ומפוכחת של הקריירה בהייטק. הוא משלב תובנות
            אישיות עם מידע מעשי, מה שהופך אותו למדריך שימושי למתכנתים מתחילים
            ומנוסים כאחד. אהבתי במיוחד את הגישה הישירה שלו לאתגרים ולהזדמנויות
            בתעשייה
          </p>
          <div className="flex items-center gap-4">
            <QuoteIcon>🙃</QuoteIcon>
            <p className="text-sm text-gray-500">- ולדיסלב, מתכנת באינטל</p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-semibold text-center mb-10">
          רוצים גם להיות מרוצים ולשלוח המלצות? הזמינו את הספר עכשיו!
        </h3>
        <div className="flex flex-col gap-2 min-[400px]:flex-row">
          <RonkaPhysicalBookButton />
          <RonkaDigitalBookButton />
        </div>
      </div>
    </div>
  );
};

export { Quotes };
