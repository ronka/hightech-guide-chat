import { env } from "@/services/config";
import { callChain } from "@/services/langchain";
import logger from "@/services/logger";
import arcjet, { shield, tokenBucket } from "@arcjet/next";
import type { Message } from "ai";
import { type NextRequest, NextResponse } from "next/server";

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
      { status: 403 },
    );
  }

  if (decision.isDenied()) {
    return NextResponse.json(
      { error: "Too Many Requests", reason: decision.reason },
      { status: 429 },
    );
  }

  const messages: Message[] = body.messages ?? [];
  logger.info("Messages ", messages);
  const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
  const question = messages[messages.length - 1].content;

  logger.info("Chat history ", formattedPreviousMessages.join("\n"));

  if (!question) {
    return NextResponse.json(
      {
        error: "Bad Request",
        reason: "No question provided",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const streamingTextResponse = callChain({
      question,
      chatHistory: formattedPreviousMessages.join("\n"),
    });

    return streamingTextResponse;
  } catch (error) {
    console.error("Internal server error ", error);
    return NextResponse.json(
      {
        error: "Error: Something went wrong. Try again!",
      },
      {
        status: 500,
      },
    );
  }
}
