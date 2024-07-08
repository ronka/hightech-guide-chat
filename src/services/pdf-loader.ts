import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import type { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import flattenDeep from "lodash/flattenDeep";
import logger from "./logger";

export async function getChunkedDocsFromUploadedPDFs(
  fileList: File[],
): Promise<Document<Record<string, unknown>>[]> {
  try {
    const loaderList = fileList.map((file) => new WebPDFLoader(file));
    const docs = flattenDeep(
      await Promise.all(loaderList.map((loader) => loader.load())),
    );

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunkedDocs = await textSplitter.splitDocuments(docs);

    return chunkedDocs;
  } catch (error) {
    logger.error(`Error loading PDF: ${fileList} ${error}`);
    throw new Error("Error loading PDF");
  }
}
