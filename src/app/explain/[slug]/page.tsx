import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { frontmatter } = await getWordData(params.slug);
  if (!frontmatter) return { title: "Word Not Found" };
  return {
    title: `${frontmatter.title} - Tech Dictionary`,
    description: `Learn about ${frontmatter.title} (${frontmatter.acronym}) in our tech dictionary.`,
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

  if (!frontmatter || !content) notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/words"
        className="text-primary hover:underline mb-4 inline-block"
      >
        &larr; Back to All Words
      </Link>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{frontmatter.title}</CardTitle>
              <CardDescription className="text-lg">
                [{frontmatter.acronym}]
              </CardDescription>
            </div>
            <Badge variant="secondary">{frontmatter.category}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <MDXRemote source={content} />
          <div>
            <h3 className="font-semibold mb-2">Related Terms 🔗:</h3>
            <div className="flex flex-wrap gap-2">
              {frontmatter.relatedTerms.map((term: string) => (
                <Link href={`/words/${encodeURIComponent(term)}`} key={term}>
                  <Badge
                    variant="outline"
                    className="hover:bg-primary hover:text-primary-foreground cursor-pointer"
                  >
                    {term}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-4">
            <Button variant="outline" size="sm">
              Helpful 👍
            </Button>
            <Button variant="outline" size="sm">
              Share 🔗
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
