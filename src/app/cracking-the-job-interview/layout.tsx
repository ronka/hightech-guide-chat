import { Metadata } from "next";

export const metadata: Metadata = {
    title: "מפצחים את קוד הראיון: המדריך המלא להצלחה בראיונות טכניים",
    description:
        "הקורס היחיד שהופך את תהליך הראיונות ממפחיד למנצח. שעתיים ממוקדות שיעניקו לך את הכלים להתקבל לתפקיד שאתה רוצה.",
    openGraph: {
        title: "מפצחים את קוד הראיון: המדריך המלא להצלחה בראיונות טכניים",
        description:
            "הקורס היחיד שהופך את תהליך הראיונות ממפחיד למנצח. שעתיים ממוקדות שיעניקו לך את הכלים להתקבל לתפקיד שאתה רוצה.",
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
        title: "מפצחים את קוד הראיון: המדריך המלא להצלחה בראיונות טכניים",
        description:
            "הקורס היחיד שהופך את תהליך הראיונות ממפחיד למנצח. שעתיים ממוקדות שיעניקו לך את הכלים להתקבל לתפקיד שאתה רוצה.",
        images: ["https://ronka.dev/wp-content/uploads/2025/04/malben-2.png"],
    },
};

export default function CrackingTheJobInterviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

