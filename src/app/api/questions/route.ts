import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

type QuestionListItem = {
    id: number;
    title: string;
    titleHe: string;
    difficulty: string;
    difficultyEn: string;
    category: string;
    categoryEn: string;
    solved: boolean;
    acceptance: string;
    slug: string;
};

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

export async function GET() {
    try {
        const questionsDir = path.join(process.cwd(), "src/questions");
        const entries = await fs.readdir(questionsDir, { withFileTypes: true });
        const mdxFiles = entries
            .filter((e) => e.isFile() && e.name.endsWith(".mdx"))
            .map((e) => e.name);

        const items: QuestionListItem[] = [];

        for (const fileName of mdxFiles) {
            const filePath = path.join(questionsDir, fileName);
            try {
                const raw = await fs.readFile(filePath, "utf8");
                const { data: frontmatter, content } = matter(raw);
                const titles = parseTitlesFromH1(content || "");

                const id = Number((frontmatter as any).id) || Number(fileName.match(/(\d+)/)?.[1]) || 0;
                const difficultyHe = (frontmatter as any).difficulty || "הכל";
                const difficultyEn =
                    difficultyHe === "קל" ? "Easy" : difficultyHe === "בינוני" ? "Medium" : difficultyHe === "קשה" ? "Hard" : "";

                const item: QuestionListItem = {
                    id,
                    title: (frontmatter as any).title || titles.en || "",
                    titleHe: (frontmatter as any).titleHe || titles.he || "",
                    difficulty: difficultyHe,
                    difficultyEn,
                    category: (frontmatter as any).categoryHe || (frontmatter as any).category || "כללי",
                    categoryEn: (frontmatter as any).category || "General",
                    solved: Boolean((frontmatter as any).solved) || false,
                    acceptance: (frontmatter as any).acceptance || "—",
                    slug: fileName.replace(".mdx", ""),
                };
                items.push(item);
            } catch (e) {
                // skip invalid file
            }
        }

        items.sort((a, b) => a.id - b.id);
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json({ error: "Failed to read questions" }, { status: 500 });
    }
}


