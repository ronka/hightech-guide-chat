/**
 * v0 by Vercel.
 * @see https://v0.dev/t/9tNyK5fvAXn
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BOOK_PROMO } from "@/constants/links";
import { track } from "@/services/analytics";

export function BookPromo() {
  return (
    <Card className="w-full rounded-lg shadow-lg">
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src="/promo-pic.png"
          alt="Book Cover"
          className="aspect-[3/4] bg-gray-300 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>
      <CardContent className="space-y-4 p-4 -mt-4">
        <div>
          <h3 className="text-lg font-bold">המדריך להייטקיסט המתחיל</h3>
          <p className="text-muted-foreground">
            כל מה שרציתם לדעת ולא העזתם לשאול על עולם ההייטק המורכב תוכלו למצוא
            בספר שבידיכם.
          </p>
        </div>
        <Button className="w-full bg-green-500" asChild>
          <Link
            onClick={() => {
              track("Book Promo Click", {
                source: "STEIMATZKY",
              });
            }}
            href={BOOK_PROMO.STEIMATZKY}
          >
            📚 קנה עכשיו מסטימצקי
          </Link>
        </Button>
        <Button className="w-full bg-sky-500" asChild>
          <Link
            onClick={() => {
              track("Book Promo Click", {
                source: "EVRIT",
              });
            }}
            href={BOOK_PROMO.EVRIT}
          >
            📱 קנה עכשיו מע-ברית
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
