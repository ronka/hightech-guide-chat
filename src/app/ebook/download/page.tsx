import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Download } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { ebookPurchase } from "@/db/schema";
import { eq } from "drizzle-orm";
import { EBOOK_PAYLINK, EBOOK_DOWNLOAD_URL } from "@/lib/paylinks";
import { MagicLinkForm } from "@/app/login/MagicLinkForm";

export const dynamic = "force-dynamic";

export default async function EbookDownloadPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/ebook/download");
  }

  const email = session.user.email.toLowerCase().trim();

  const purchased = await db
    .select()
    .from(ebookPurchase)
    .where(eq(ebookPurchase.email, email))
    .limit(1)
    .then((rows) => rows.length > 0);

  if (!purchased) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md space-y-6 text-center">
          <h1 className="text-2xl font-bold">לא נמצאה רכישה</h1>
          <p className="text-muted-foreground">
            לא מצאנו רכישה של הספר הדיגיטלי עבור {email}.
          </p>
          <p className="text-muted-foreground text-sm">
            אם רכשת את הספר עם מייל אחר, אנא התחבר עם אותו מייל.
          </p>
          <div className="container mx-auto">
            <MagicLinkForm callbackUrl={"/ebook/download"} />
          </div>
          <a
            href={EBOOK_PAYLINK}
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
          >
            רכוש את הספר הדיגיטלי ←
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold">הספר הדיגיטלי שלך מוכן!</h1>
          <p className="text-muted-foreground text-lg">
            לחץ על הכפתור להורדת הספר.
          </p>
        </div>

        <a
          href={EBOOK_DOWNLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg text-base font-medium hover:bg-primary/80 transition-colors"
        >
          <Download className="h-5 w-5" />
          הורד את הספר
        </a>

        <p className="text-muted-foreground text-sm">
          מחובר כ: {email}
        </p>
      </div>
    </main>
  );
}
