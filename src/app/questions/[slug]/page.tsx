import { Metadata } from "next";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { QuestionCard } from "@/components/question-card";
import { CodeSolution } from "@/components/code-solution";
import { VideoEmbed } from "@/components/video-embed";
import { QuestionFrontmatterSchema, type QuestionFrontmatter } from "@/types/questions";

export async function generateMetadata({
    params,
}: {
    params: { slug: string };
}): Promise<Metadata> {
    const { frontmatter } = await getQuestionData(params.slug);
    if (!frontmatter) return { title: "שאלה לא נמצאה" };
    const title = frontmatter.title || "שאלה";
    return {
        title: `${title} - הפתרון לשאלה מראיון עבודה`,
        description: `כיצד לפתור את השאלה ${title} מראיון עבודה`,
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
            <div className=" mx-auto px-4">
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

                        <VideoEmbed
                            videoUrl={frontmatter.videoUrl}
                            title={frontmatter.titleHe || titles.he || frontmatter.title || titles.en || ""}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
