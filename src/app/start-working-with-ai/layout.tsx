import { Metadata } from "next";

export const metadata: Metadata = {
    title: "מתחילים לעבוד עם AI: הקורס המעשי לפיתוח עם בינה מלאכותית",
    description:
        "קורס מעשי ומקיף ללמוד לפתח עם AI מאפס – מהבנת LLMs ועד בניית אפליקציה אמיתית עם Claude Code.",
    openGraph: {
        title: "מתחילים לעבוד עם AI: הקורס המעשי לפיתוח עם בינה מלאכותית",
        description:
            "קורס מעשי ומקיף ללמוד לפתח עם AI מאפס – מהבנת LLMs ועד בניית אפליקציה אמיתית עם Claude Code.",
        type: "website",
        locale: "he_IL",
        siteName: "המדריך להייטקיסט המתחיל",
        images: [
            {
                url: "https://ronka.dev/wp-content/uploads/2025/04/malben-2.png",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "מתחילים לעבוד עם AI: הקורס המעשי לפיתוח עם בינה מלאכותית",
        description:
            "קורס מעשי ומקיף ללמוד לפתח עם AI מאפס – מהבנת LLMs ועד בניית אפליקציה אמיתית עם Claude Code.",
        images: ["https://ronka.dev/wp-content/uploads/2025/04/malben-2.png"],
    },
};

export default function StartWorkingWithAILayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
