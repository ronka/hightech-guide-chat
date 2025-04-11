import Image from "next/image";

export const About = () => {
  return (
    <div className="flex md:grid-cols-2 md:flex-row flex-col items-center justify-center space-y-4 text-center gap-10">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tighter text-muted-foreground sm:text-5xl">
          נעיר להכיר
        </h2>
        <h2 className=" text-3xl font-bold tracking-tighter sm:text-5xl">
          רון קנטור 👨‍🚀
        </h2>
        <div className="pt-10 max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400 text-right">
          <p>
            מפתח תוכנה בגוגל, ובעבר עבדתי בסטארט-אפים ובחברות קטנות. התחלתי את
            דרכי כחייל קרבי בהנדסה קרבית, ומשם התפתחתי לעולם התכנות.
          </p>
          <p>
            למדתי לתואר במדעי המחשב באוניברסיטה הפתוחה תוך כדי עבודה במשרה מלאה.
            אני מאמין גדול בלמידה עצמית ובכוחה של התמדה להוביל להצלחה.
          </p>
          <p>
            אני לא יועץ קריירה, אלא פשוט מתכנת עם 10 שנות ניסיון שאוהב את
            עבודתו, ללמד, לעזור ורוצה לחלוק את הניסיון שצבר. מטרתי היא להעניק
            השראה ותובנות מעשיות לכל מי שחולם על קריירה בעולם הטכנולוגיה.
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Image
          alt="תמונה של רון קנטור"
          width={300}
          height={300}
          src={"/book-assets/profile.png"}
        />
      </div>
    </div>
  );
};
