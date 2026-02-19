import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import { BookPromo } from "@/components/book-promo";
import { WordActions } from "@/components/word-actions";
import { TermViewTracker } from "./term-view-tracker";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { frontmatter } = await getWordData(params.slug);
  if (!frontmatter) return { title: "Word Not Found" };
  return {
    title: `${frontmatter.title} - המדריך להייטיקיסט המתחיל - מילון מושגים`,
    description: `למד עוד על ${frontmatter.title} (${frontmatter.acronym}) במילון הטכנולוגי של המדריך להייטיקיסט המתחיל`,
  };
}

async function getWordData(slug: string) {
  const filePath = path.join(process.cwd(), "src/dictionary", `${slug}.mdx`);
  try {
    const fileContents = await fs.readFile(filePath, "utf8");
    const { data: frontmatter, content } = matter(fileContents);
    return { frontmatter, content };
  } catch (error) {
    return { frontmatter: null, content: null };
  }
}

export default async function WordPage({
  params,
}: {
  params: { slug: string };
}) {
  const { frontmatter, content } = await getWordData(params.slug);

  if (!frontmatter || !content) {
    redirect(`/explain?search=${encodeURIComponent(params.slug)}`);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 md:px-4 py-2">
          <Card className=" mx-auto">
            <CardHeader>
              <Link
                href="/explain"
                className="text-primary hover:underline mb-4 inline-block"
              >
                &rarr; חזרה למילים
              </Link>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl">
                    {frontmatter.title}
                  </CardTitle>
                  {frontmatter.acronym.length > 0 && (
                    <CardDescription className="text-lg">
                      [{frontmatter.acronym}]
                    </CardDescription>
                  )}
                </div>
                <Badge variant="secondary">{frontmatter.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <MDXRemote source={content} />
              {/* <div>
					<h3 className="font-semibold mb-2">מושגים קשורים 🔗:</h3>
					<div className="flex flex-wrap gap-2">
					{frontmatter.relatedTerms.map((term: string) => (
						<Link href={`/explain/${encodeURIComponent(term)}`} key={term}>
						<Badge
							variant="outline"
							className="hover:bg-primary hover:text-primary-foreground cursor-pointer"
						>
							{term}
						</Badge>
						</Link>
					))}
					</div>
				</div> */}
              <TermViewTracker slug={params.slug} title={frontmatter.title} category={frontmatter.category} />
              <WordActions slug={params.slug} title={frontmatter.title} />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1 md:px-4 py-2">
          <BookPromo />
        </div>
      </div>
    </div>
  );
}
