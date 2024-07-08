import { env } from "@/services/config";
import logger from "@/services/logger";
import { getChunkedDocsFromUploadedPDFs } from "@/services/pdf-loader";
import { getPineconeClient } from "@/services/pinecone-client";
import { embedAndStoreDocs } from "@/services/vector-store";
import arcjet, { shield, tokenBucket } from "@arcjet/next";
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

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const searchParams = new URL(req.url).searchParams;
  const sessionId = searchParams.get("sessionId") || "";
  if (!searchParams.has("sessionId")) {
    return NextResponse.json(
      { error: "Bad Request", reason: "No sessionId provided" },
      {
        status: 400,
      },
    );
  }
  const decision = await aj.protect(req, { sessionId, requested: 1 }); // Deduct 1 token from the bucket
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

  const files = [];
  for (const [_name, file] of formData) {
    files.push(file as File);
  }

  try {
    await saveOnPinecone(files);

    return NextResponse.json({
      status: 200,
    });
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

const saveOnPinecone = async (files: File[]) => {
  try {
    const pineconeClient = await getPineconeClient();

    logger.info("Preparing chunks from PDF files");

    const docs = await getChunkedDocsFromUploadedPDFs(files);

    logger.info(`Loading ${docs.length} chunks into pinecone...`);

    await embedAndStoreDocs(pineconeClient, docs);
    logger.info("Data embedded and stored in pine-cone successfully.");
  } catch (error) {
    console.error("Init client script failed ", error);
  }
};
