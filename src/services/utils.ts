import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
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

export function formattedText(inputText: string) {
  const text = inputText
    .replace(/\n+/g, " ") // Replace multiple consecutive new lines with a single space
    .replace(/(\w) - (\w)/g, "$1$2") // Join hyphenated words together
    .replace(/\s+/g, " "); // Replace multiple consecutive spaces with a single space

  return `...${text}...`;
}

// Initial message structure for AI SDK v5
interface InitialMessage {
  role: string;
  id: string;
  parts: Array<{ type: "text"; text: string }>;
}

// Default UI Message
export const initialMessages: InitialMessage[] = [
  {
    role: "assistant",
    id: "0",
    parts: [
      {
        type: "text",
        text: `היי! אני עוזר דיגיטלי חכם שמבוסס על הספר "המדריך להייטקיסט המתחיל". אשמח לענות על שאלות בנושאי קריירה בהייטק, טיפים למתחילים בתעשייה, או כל דבר שקשור לעולם ההייטק ולתוכן הספר בפרט. במה אוכל לעזור לך היום?`,
      },
    ],
  },
];

export interface Source {
  pageContent: string;
  pageNumber: number;
}
interface Data {
  sources: Source[];
}

const dataSchema: z.ZodSchema<Data> = z.object({
  sources: z.array(
    z.object({ pageContent: z.string(), pageNumber: z.number() })
  ),
});

// Tool part interface for AI SDK v5
interface ToolPart {
  type?: string;
  toolName?: string;
  state?: string;
  output?: Array<{ pageContent: string; pageNumber: number }>;
}

// Maps the sources with the right ai-message
// In AI SDK v5, tool invocations are parts with type starting with "tool-"
export const getSources = (toolParts: unknown[]): Source[] => {
  const sources: Source[] = [];

  toolParts.forEach((part) => {
    if (!part || typeof part !== "object") return;

    const toolPart = part as ToolPart;

    // Get tool name from type (e.g., "tool-getInformation" -> "getInformation")
    // or from toolName property for dynamic tools
    const toolName =
      toolPart.toolName ||
      (toolPart.type?.startsWith("tool-")
        ? toolPart.type.replace("tool-", "")
        : null);

    if (toolName !== "getInformation") {
      return;
    }

    // In AI SDK v5, check for output-available state
    if (
      toolPart.state !== "output-available" &&
      toolPart.state !== "result"
    ) {
      return;
    }

    const output = toolPart.output;
    if (!output || !Array.isArray(output)) return;

    output.forEach((source: { pageContent: string; pageNumber: number }) => {
      sources.push({
        pageContent: source.pageContent,
        pageNumber: source.pageNumber,
      });
    });
  });

  return sources;
};

export const pageNumberToChapter = (pageNumber: number) => {
  if (pageNumber < 11) {
    return "הקדמה";
  } else if (pageNumber < 24) {
    return "פרק 1: איך סיימתי תואר במדעי המחשב תוך כדי עבודהבמשרה מלאה בשלוש וחצי שנים";
  } else if (pageNumber < 41) {
    return "פרק 2: דברים שהייתי רוצה לדעת לפני שהתחלתי לעבוד בהייטק";
  } else if (pageNumber < 67) {
    return "פרק 3: קורות חיים, ראיונות עבודה ומה שביניהם";
  } else if (pageNumber < 98) {
    return "פרק 4: דברים שהייתי רוצה לדעת לפני שהתחלתי לתכנת";
  } else if (pageNumber < 111) {
    return "פרק 5: מבית תוכנה עד לגוגל, ההבדלים בין חברותבסדרי גודל שונים";
  } else if (pageNumber < 121) {
    return "פרק 6: ניהול משימות";
  } else if (pageNumber < 150) {
    return "פרק 7: הכנה לראיונות הטכניים";
  } else if (pageNumber < 161) {
    return "פרק 8: הכנה לראיונות אישיים";
  } else if (pageNumber < 163) {
    return "פרק 9: סיכום מסע";
  }

  return null;
};
