import { env } from "./config";

import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import logger from "./logger";
import { getPineconeClient } from "./pinecone-client";

export async function embedAndStoreDocs(
  // @ts-ignore docs type error
  docs: Document<Record<string, unknown>>[],
) {
  /*create and store the embeddings in the vectorStore*/
  try {
    const pineconeClient = await getPineconeClient();
    const embeddings = new OpenAIEmbeddings();

    const index = pineconeClient.index(env.PINECONE_INDEX_NAME);

    //embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
    });
  } catch (error) {
    logger.error(error);
    throw new Error("Failed to load your docs !");
  }
}

// Returns vector-store handle to be used a retrievers on langchains
export async function getVectorStore() {
  try {
    const pineconeClient = await getPineconeClient();
    const embeddings = new OpenAIEmbeddings();
    const index = pineconeClient.index(env.PINECONE_INDEX_NAME);

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      textKey: "text",
    });

    return vectorStore;
  } catch (error) {
    logger.error("error ", error);
    throw new Error("Something went wrong while getting vector store !");
  }
}
