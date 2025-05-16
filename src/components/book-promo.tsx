"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BOOK_PROMO } from "@/constants/links";
import { track } from "@/services/analytics";
import {
  RonkaDigitalBookButton,
  RonkaPhysicalBookButton,
} from "./landing-page/buttons";

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
        <RonkaPhysicalBookButton />
        <RonkaDigitalBookButton />
      </CardContent>
    </Card>
  );
}
