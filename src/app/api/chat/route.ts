import { env } from "@/services/config";
import {
  findRelevantContent,
  getExtraLinks,
  getFirstJob,
  getLinksFromTheBook,
  getTheBook as getTheBookPurchaseLinks,
} from "@/services/embedding";
import logger from "@/services/logger";
import { SYSTEM_PROMPT } from "@/services/prompt-templates";
import { streamText, tool, gateway } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const sessionId = body.sessionId;

  const messages = body.messages ?? [];

  const result = streamText({
    model: "google/gemini-2.5-flash",
    messages,
    system: SYSTEM_PROMPT,
    tools: {
      getFirstJob: tool({
        description: `How to get your first job`,
        inputSchema: z.object({}),
        execute: async () => getFirstJob(),
      }),
      getLinksFromTheBook: tool({
        description: `Get links descibred in the book`,
        inputSchema: z.object({}),
        execute: async () => getLinksFromTheBook(),
      }),
      getExtraLinks: tool({
        description: `Get extra links mentioned from the book`,
        inputSchema: z.object({}),
        execute: async () => getExtraLinks(),
      }),
      getTheBook: tool({
        description: `Get links to buy the book`,
        inputSchema: z.object({}),
        execute: async () => getTheBookPurchaseLinks(),
      }),
      getInformation: tool({
        description: `Get information about the book to answer questions.`,
        inputSchema: z.object({
          question: z.string().describe("the users question"),
        }),
        execute: async ({ question }) => findRelevantContent(question),
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
