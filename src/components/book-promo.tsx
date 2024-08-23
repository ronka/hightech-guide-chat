/**
 * v0 by Vercel.
 * @see https://v0.dev/t/9tNyK5fvAXn
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function BookPromo() {
  return (
    <Card className="w-full rounded-lg shadow-lg">
      <div className="relative overflow-hidden rounded-t-lg">
        {/* TODO: replace with a fitting image */}
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
          {/* TODO: replace with bitly */}
          <Link href="https://www.steimatzky.co.il/011360920">
            📚 קנה עכשיו מסטימצקי
          </Link>
        </Button>
        <Button className="w-full bg-sky-500" asChild>
          {/* TODO: replace with bitly */}
          <Link href="https://www.e-vrit.co.il/Product/33185/%D7%94%D7%9E%D7%93%D7%A8%D7%99%D7%9A_%D7%9C%D7%94%D7%99%D7%99%D7%98%D7%A7%D7%99%D7%A1%D7%98_%D7%94%D7%9E%D7%AA%D7%97%D7%99%D7%9C">
            📱 קנה עכשיו מע-ברית
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
