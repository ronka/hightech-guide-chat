import { CheckCircle } from "lucide-react";

export default function BookThanksPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <h1 className="text-3xl font-bold">תודה על הרכישה!</h1>
          <p className="text-muted-foreground text-lg">
            הספר בדרך אליך. נשלח אליך אישור עם פרטי המשלוח בהקדם.
          </p>
        </div>
      </div>
    </main>
  );
}
