import type { Message } from "ai";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { JSONValue } from "ai";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function scrollToBottom(containerRef: React.RefObject<HTMLElement>) {
  if (containerRef.current) {
    const lastMessage = containerRef.current.lastElementChild;
    if (lastMessage) {
      const scrollOptions: ScrollIntoViewOptions = {
        behavior: "smooth",
        block: "end",
      };
      lastMessage.scrollIntoView(scrollOptions);
    }
  }
}

// Reference:
// github.com/hwchase17/langchainjs/blob/357d6fccfc78f1332b54d2302d92e12f0861c12c/examples/src/guides/expression_language/cookbook_conversational_retrieval.ts#L61
export const formatChatHistory = (chatHistory: [string, string][]) => {
  const formattedDialogueTurns = chatHistory.map(
    (dialogueTurn) => `Human: ${dialogueTurn[0]}\nAssistant: ${dialogueTurn[1]}`
  );

  return formattedDialogueTurns.join("\n");
};

export function formatPageNumber(input: string): string {
  // Regex to match and capture the format "<number> I" or "I <number>"
  const match = input.match(/(\d+)\s*I|I\s*(\d+)/);

  if (match) {
    const pageNumber = match[1] || match[2]; // Capture the page number
    // Remove everything before and including the pattern "<number> I" or "I <number>"
    const restOfMessage = input.replace(/^.*I\s*\d+\s*/, "").trim();
    return `[עמוד ${pageNumber}]: ${restOfMessage}`;
  }

  return input;
}

export function formattedText(inputText: string) {
  return inputText
    .replace(/\n+/g, " ") // Replace multiple consecutive new lines with a single space
    .replace(/(\w) - (\w)/g, "$1$2") // Join hyphenated words together
    .replace(/\s+/g, " "); // Replace multiple consecutive spaces with a single space
}

// Default UI Message
export const initialMessages: Message[] = [
  {
    role: "assistant",
    id: "0",
    content:
      "היי! אני בוט AI לספר להייטקיסט המתחיל, תשאל אותי מה שתרצה לגבי הספר",
  },
];

interface Data {
  sources: string[];
}

const dataSchema: z.ZodSchema<Data> = z.object({
  sources: z.array(z.string()),
});

// Maps the sources with the right ai-message
export const getSources = (
  data: JSONValue[],
  role: string,
  index: number
): string[] => {
  if (role !== "assistant" || index < 2 || (index - 2) % 2 !== 0) {
    return [];
  }

  const sourcesIndex = (index - 2) / 2;
  const parsedData = dataSchema.safeParse(data[sourcesIndex]);

  // Check if parsing was successful and sources exist
  return parsedData.success && parsedData.data.sources
    ? parsedData.data.sources
    : [];
};
