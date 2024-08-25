import { Quote } from "lucide-react";

const Quotes = () => {
  return (
    <div className="container px-4 md:px-6">
      <h2 className="text-3xl font-bold tracking-tighter text-center mb-8 sm:text-5xl">
        מה קוראים אמרו?
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
          <Quote className="h-8 w-8 text-gray-400" />
          <p className="text-lg font-medium">
            הספר של רון הוא פשוט מדהים! הוא מצליח לקחת את המסע המורכב והמאתגר של
            כניסה לעולם ההייטק ולהפוך אותו למסע מרתק ונגיש. הסיפור האישי שלו,
            מחייל קרבי למפתח בגוגל, נותן תקווה והשראה לכל מי שחולם על קריירה
            בטכנולוגיה. זה לא סתם ספר, זה מפת דרכים להצלחה בהייטק!
          </p>
          <p className="text-sm text-gray-500">
            - מתן, סטודנט באוניברסיטה הפתוחה
          </p>
        </div>
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
          <p className="text-sm text-gray-500">
            - עומר, בוגר טכניון, מחפש משרה שניה
          </p>
        </div>
        <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
          <Quote className="h-8 w-8 text-gray-400" />
          <p className="text-lg font-medium">
            הספר מציג תמונה מאוזנת ומפוכחת של הקריירה בהייטק. הוא משלב תובנות
            אישיות עם מידע מעשי, מה שהופך אותו למדריך שימושי למתכנתים מתחילים
            ומנוסים כאחד. אהבתי במיוחד את הגישה הישירה שלו לאתגרים ולהזדמנויות
            בתעשייה
          </p>
          <p className="text-sm text-gray-500">- ולדיסלב, מתכנת באינטל</p>
        </div>
      </div>
    </div>
  );
};

export { Quotes };
