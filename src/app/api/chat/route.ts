import { env } from "@/services/config";
import { findRelevantContent } from "@/services/embedding";
import logger from "@/services/logger";
import { QA_TEMPLATE } from "@/services/prompt-templates";
import { openai } from "@ai-sdk/openai";
import arcjet, { shield, tokenBucket } from "@arcjet/next";
import {
  streamText,
  createDataStreamResponse,
  generateId,
  tool,
  type Message,
} from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN", // will block requests. Use "DRY_RUN" to log only
      characteristics: ["sessionId"], // track requests by a custom session ID
      refillRate: 1, // 1 token per interval
      interval: 7200, // 2 hours
      capacity: 5, // bucket maximum capacity of 5 tokens
    }),
    shield({
      mode: "DRY_RUN",
    }),
  ],
});

const formatMessage = (message: Message) => {
  return `${message.role === "user" ? "Human" : "Assistant"}: ${
    message.content
  }`;
};

export async function POST(req: NextRequest) {
  const body = await req.json();

  const sessionId = body.sessionId;
  const decision = await aj.protect(req, { sessionId, requested: 1 }); // Deduct 5 tokens from the bucket
  logger.info("Arcjet decision", decision);

  if (decision.isDenied() && decision.reason.isShield()) {
    return NextResponse.json(
      {
        error: "Forbidden",
        reason: decision.reason,
      },
      { status: 403 }
    );
  }

  if (decision.isDenied()) {
    return NextResponse.json(
      { error: "Too Many Requests", reason: decision.reason },
      { status: 429 }
    );
  }

  const messages: Message[] = body.messages ?? [];

  // immediately start streaming (solves RAG issues with status, etc.)
  return createDataStreamResponse({
    execute: (dataStream) => {
      dataStream.writeData("initialized call");

      const result = streamText({
        model: openai("gpt-4o"),
        messages,
        system: QA_TEMPLATE,
        //         system: `You are a helpful assistant. Check your knowledge base before answering any questions.
        // Only respond to questions using information from tool calls.
        // if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
        onFinish(event) {
          console.log("$#@$#@$%@#$#@");
          console.log("$#@$#@$%@#$#@");
          console.log("event", event);
          console.log("$#@$#@$%@#$#@");
          console.log("$#@$#@$%@#$#@");
          // message annotation:
          dataStream.writeMessageAnnotation({
            id: generateId(), // e.g. id from saved DB record
            other: "information",
          });

          // call annotation:
          dataStream.writeData("call completed");
        },
        tools: {
          getInformation: tool({
            description: `get information from your knowledge base to answer questions.`,
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
