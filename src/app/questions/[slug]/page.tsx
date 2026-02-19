import { Metadata } from "next";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { QuestionCard } from "@/components/question-card";
import { CodeSolution } from "@/components/code-solution";
import { VideoEmbed } from "@/components/video-embed";
import { QuestionFrontmatterSchema, type QuestionFrontmatter } from "@/types/questions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { QuestionViewTracker } from "./question-view-tracker";

export async function generateMetadata({
    params,
}: {
    params: { slug: string };
}): Promise<Metadata> {
    const { frontmatter } = await getQuestionData(params.slug);
    if (!frontmatter) return { title: "שאלה לא נמצאה" };
    const displayTitle = frontmatter.titleHe || frontmatter.title || "שאלה";
    const baseDesc = `כיצד לפתור את השאלה ${displayTitle} מראיון עבודה`;
    const extras: string[] = [];
    if (frontmatter.source) extras.push(`שאלת ${frontmatter.source}`);
    if (Array.isArray(frontmatter.companies) && frontmatter.companies.length > 0) {
        extras.push(`נשאל ב: ${frontmatter.companies.join(", ")}`);
    }
    const description = [baseDesc, ...extras].join(" · ");
    return {
        title: `${displayTitle} - הפתרון לשאלה מראיון עבודה`,
        description,
        keywords: [
            displayTitle,
            "שאלות מראיונות עבודה",
            "פתרון",
            ...(frontmatter.source ? [frontmatter.source] : []),
            ...((Array.isArray(frontmatter.companies) ? frontmatter.companies : []) as string[]),
        ],
        openGraph: {
            title: `${displayTitle} - הפתרון לשאלה מראיון עבודה`,
            description,
            url: `/questions/${params.slug}`,
        },
        twitter: {
            card: "summary_large_image",
            title: `${displayTitle} - הפתרון לשאלה מראיון עבודה`,
            description,
        },
    };
}

type QuestionData = { frontmatter: QuestionFrontmatter | null; content: string | null };

async function getQuestionData(slug: string): Promise<QuestionData> {
    const filePath = path.join(process.cwd(), "src/questions", `${slug}.mdx`);
    try {
        const fileContents = await fs.readFile(filePath, "utf8");
        const { data: frontmatterRaw, content } = matter(fileContents);
        const parsed = QuestionFrontmatterSchema.safeParse(frontmatterRaw);
        if (!parsed.success) {
            return { frontmatter: null, content: null };
        }
        const frontmatter: QuestionFrontmatter = parsed.data;
        return { frontmatter, content };
    } catch (error) {
        return { frontmatter: null, content: null };
    }
}

function extractSection(content: string, header: string): string {
    try {
        const escapedHeader = header.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        // Prefer matching until the next H2 header
        const upToNextHeader = new RegExp(`^##\\s*${escapedHeader}\\s*\n?([\\s\\S]*?)(?=\n##\\s)`, "m");
        const matchNext = content.match(upToNextHeader);
        if (matchNext) {
            return (matchNext[1] || "").trim();
        }
        // Fallback: match until the end of the document
        const toEnd = new RegExp(`^##\\s*${escapedHeader}\\s*\n?([\\s\\S]*)$`, "m");
        const matchEnd = content.match(toEnd);
        if (matchEnd) {
            return (matchEnd[1] || "").trim();
        }
        return "";
    } catch {
        console.log('failed to extract section', header)
        return "";
    }
}

function parseTitlesFromH1(content: string): { he?: string; en?: string } {
    const h1Match = content.match(/^#\s*(.+)$/m);
    if (!h1Match) return {};
    const titleLine = h1Match[1].trim();
    if (titleLine.includes("/")) {
        const parts = titleLine.split("/").map((p) => p.trim());
        return { en: parts[0] || undefined, he: parts[1] || undefined };
    }
    return { en: titleLine };
}

function extractSolutionsByLanguage(content: string): Record<string, string> {
    const solutionsSection = extractSection(content, "פיתרון");
    const results: Record<string, string> = {};
    if (!solutionsSection) return results;
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match: RegExpExecArray | null;
    while ((match = codeBlockRegex.exec(solutionsSection)) !== null) {
        const lang = (match[1] || "").toLowerCase();
        const code = (match[2] || "").trim();
        if (lang && code) {
            results[lang] = code;
        }
    }
    return results;
}

export default async function QuestionPage({
    params,
}: {
    params: { slug: string };
}) {
    const { frontmatter, content } = await getQuestionData(params.slug);

    if (!frontmatter || !content) {
        redirect("/questions");
    }

    const descriptionHe = extractSection(content, "תיאור השאלה");
    const titles = parseTitlesFromH1(content);
    const solutionsByLang = extractSolutionsByLanguage(content);

    return (
        <div className="min-h-screen">
            <QuestionViewTracker
                slug={params.slug}
                title={frontmatter.titleHe || frontmatter.title || ""}
                difficulty={frontmatter.difficulty ?? ""}
                category={frontmatter.category}
            />
            <div className=" mx-auto px-4">
                <div className="py-4 flex justify-end ">
                    <Link href="/questions" className="inline-flex items-center text-sm hover:underline" aria-label="חזרה לשאלות">
                        חזרה לשאלות
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    <div className="lg:col-span-3 space-y-6">
                        <QuestionCard question={{
                            id: frontmatter.id ?? 0,
                            title: {
                                he: frontmatter.titleHe || titles.he || frontmatter.title || "",
                                en: frontmatter.title || titles.en || "",
                            },
                            difficulty: frontmatter.difficulty ?? "",
                            description: { he: descriptionHe || "", en: "" },
                            source: frontmatter.source,
                            companies: Array.isArray(frontmatter.companies) ? frontmatter.companies : undefined,
                        }} />

                        <CodeSolution solutions={solutionsByLang} />

                        {frontmatter.videoUrl && (
                            <VideoEmbed
                                videoUrl={frontmatter.videoUrl}
                                title={frontmatter.titleHe || titles.he || frontmatter.title || titles.en || ""}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
