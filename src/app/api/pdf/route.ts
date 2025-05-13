import { env } from "@/services/config";
import logger from "@/services/logger";
import { getChunkedDocsFromUploadedPDFs } from "@/services/pdf-loader";
import { getPineconeClient } from "@/services/pinecone-client";
import { embedAndStoreDocs } from "@/services/vector-store";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const searchParams = new URL(req.url).searchParams;
  if (!searchParams.has("sessionId")) {
    return NextResponse.json(
      { error: "Bad Request", reason: "No sessionId provided" },
      {
        status: 400,
      }
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
      }
    );
  }
}

const saveOnPinecone = async (files: File[]) => {
  try {
    logger.info("Preparing chunks from PDF files");
    const docs = await getChunkedDocsFromUploadedPDFs(files);

    logger.info(`Loading ${docs.length} chunks into pinecone...`);

    await embedAndStoreDocs(docs);
    logger.info("Data embedded and stored in pine-cone successfully.");
  } catch (error) {
    console.error("saveOnPinecone failed ", error);
  }
};
