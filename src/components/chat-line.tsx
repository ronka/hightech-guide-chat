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
import { formatPageNumber, formattedText } from "@/services/utils";
import type { Message } from "ai/react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import Balancer from "react-wrap-balancer";
import { Button } from "./ui/button";

function wrapMarkdownLink(input: string): React.ReactNode {
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/;

  if (markdownLinkRegex.test(input)) {
    return (
      <ReactMarkdown
        components={{
          a: ({ href, ...props }) => (
            <Link
              className="text-blue-500 hover:underline"
              href={href ?? ""}
              {...props}
            />
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

interface ChatLineProps extends Partial<Message> {
  sources: string[];
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
                  <AccordionItem value={`source-${index}`} key={index + source}>
                    <AccordionTrigger>{`מקור ${index + 1}`}</AccordionTrigger>
                    <AccordionContent>
                      <ReactMarkdown linkTarget="_blank">
                        {formatPageNumber(formattedText(source))}
                      </ReactMarkdown>
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
