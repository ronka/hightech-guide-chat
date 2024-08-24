import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { pageNumberToChapter, formattedText, Source } from "@/services/utils";
import type { Message } from "ai/react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import Balancer from "react-wrap-balancer";
import { Badge } from "./ui/badge";

function wrapMarkdownLink(input: string): React.ReactNode {
  const markdownLinkRegex = /\[([^\]]+)\]\(([^\s\)]+)(?: "([^"]+)")?\)/;

  if (markdownLinkRegex.test(input.trim())) {
    return (
      <ReactMarkdown
        components={{
          a: ({ href, children, ...props }) => (
            <Link
              className="text-blue-500 hover:underline"
              href={href ?? ""}
              target="_blank"
              {...props}
            >
              {children} ↖
            </Link>
          ),
        }}
      >
        {input}
      </ReactMarkdown>
    );
  }

  return input;
}

const convertNewLines = (text: string) =>
  text.split("\n").map((line, i) => (
    <span key={`${i}-${line}`}>
      {wrapMarkdownLink(line)}
      <br />
    </span>
  ));

const ChapterBadge = ({ pageNumber }: { pageNumber: number }) => {
  const chapter = pageNumberToChapter(pageNumber);

  if (!chapter) {
    return <></>;
  }

  return <Badge variant={"secondary"}>{chapter}</Badge>;
};

interface ChatLineProps extends Partial<Message> {
  sources: Source[];
}

export function ChatLine({
  role = "assistant",
  content,
  sources,
}: ChatLineProps) {
  if (!content) {
    return null;
  }

  const formattedMessage = convertNewLines(content);

  return (
    <div>
      <Card className="mb-2">
        <CardHeader>
          <CardTitle
            className={
              role !== "assistant"
                ? "text-amber-500 dark:text-amber-200"
                : "text-blue-500 dark:text-blue-200"
            }
          >
            {role === "assistant" ? "AI" : "הייטקיסט מתחיל"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <Balancer>{formattedMessage}</Balancer>
        </CardContent>
        <CardFooter>
          <CardDescription className="w-full">
            {sources?.length ? (
              <Accordion type="single" collapsible className="w-full">
                {sources.map((source, index) => (
                  <AccordionItem value={`source-${index}`} key={index}>
                    <AccordionTrigger>
                      <div className="flex gap-4">
                        <Badge>עמוד {source.pageNumber}</Badge>
                        <ChapterBadge pageNumber={source.pageNumber} />
                        <Badge variant={"outline"}>מקור {index + 1}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <blockquote className="bg-muted p-4 rounded-md border-l-4 border-primary">
                        <ReactMarkdown linkTarget="_blank">
                          {formattedText(source.pageContent)}
                        </ReactMarkdown>
                      </blockquote>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <></>
            )}
          </CardDescription>
        </CardFooter>
      </Card>
    </div>
  );
}
