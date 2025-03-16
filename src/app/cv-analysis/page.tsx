import { Metadata } from "next";
import { CVAnalysisClient } from "./cv-analysis-client";

export const metadata: Metadata = {
  title: "ניתוח קורות חיים חכם | בדיקת התאמה למערכות ATS",
  description:
    "כלי חכם לניתוח קורות חיים ובדיקת התאמה למערכות ATS. קבלו ניתוח מקיף, ציון התאמה וטיפים לשיפור קורות החיים שלכם.",
  keywords: [
    "ניתוח קורות חיים",
    "ATS",
    "מערכת סינון מועמדים",
    "קורות חיים",
    "חיפוש עבודה",
    "גיוס",
    "משרות",
    "קריירה",
  ],
  openGraph: {
    title: "ניתוח קורות חיים חכם | בדיקת התאמה למערכות ATS",
    description:
      "כלי חכם לניתוח קורות חיים ובדיקת התאמה למערכות ATS. קבלו ניתוח מקיף וטיפים לשיפור.",
    type: "website",
    locale: "he_IL",
  },
};

export default function CVAnalysisPage() {
  return <CVAnalysisClient />;
}
