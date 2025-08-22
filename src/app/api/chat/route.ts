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
import { google } from "@ai-sdk/google";
import {
  streamText,
  createDataStreamResponse,
  generateId,
  tool,
  type Message,
} from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const formatMessage = (message: Message) => {
  return `${message.role === "user" ? "Human" : "Assistant"}: ${
    message.content
  }`;
};

export async function POST(req: NextRequest) {
  const body = await req.json();

  const sessionId = body.sessionId;

  const messages: Message[] = body.messages ?? [];

  // immediately start streaming (solves RAG issues with status, etc.)
  return createDataStreamResponse({
    execute: (dataStream) => {
      dataStream.writeData("initialized call");

      const result = streamText({
        model: google("gemini-2.0-flash-001"),
        messages,
        system: SYSTEM_PROMPT,
        tools: {
          getFirstJob: tool({
            description: `How to get your first job`,
            parameters: z.object({}),
            execute: async () => getFirstJob(),
          }),
          getLinksFromTheBook: tool({
            description: `Get links descibred in the book`,
            parameters: z.object({}),
            execute: async () => getLinksFromTheBook(),
          }),
          getExtraLinks: tool({
            description: `Get extra links mentioned from the book`,
            parameters: z.object({}),
            execute: async () => getExtraLinks(),
          }),
          getTheBook: tool({
            description: `Get links to buy the book`,
            parameters: z.object({}),
            execute: async () => getTheBookPurchaseLinks(),
          }),
          getInformation: tool({
            description: `Get information about the book to answer questions.`,
            parameters: z.object({
              question: z.string().describe("the users question"),
            }),
            execute: async ({ question }) => findRelevantContent(question),
          }),
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
    onError: (error) => {
      // Error messages are masked by default for security reasons.
      // If you want to expose the error message to the client, you can do so here:
      return error instanceof Error ? error.message : String(error);
    },
  });
}
