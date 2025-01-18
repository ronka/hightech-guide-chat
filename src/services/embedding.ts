import { embed } from "ai";
import { getVectorStore } from "./vector-store";
import { openai } from "@ai-sdk/openai";

const embeddingModel = openai.embedding("text-embedding-ada-002");

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split(".")
    .filter((i) => i !== "");
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll("\\n", " ");
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

export const findRelevantContent = async (userQuery: string) => {
  //   const userQueryEmbedded = await generateEmbedding(userQuery);
  //   const similarity = sql<number>`1 - (${cosineDistance(
  //     embeddings.embedding,
  //     userQueryEmbedded
  //   )})`;

  //   const similarGuides = await db
  //     .select({ name: embeddings.content, similarity })
  //     .from(embeddings)
  //     .where(gt(similarity, 0.5))
  //     .orderBy((t) => desc(t.similarity))
  //     .limit(4);

  const vectorStore = await getVectorStore();

  const similarGuides = await vectorStore.similaritySearch(userQuery);

  const sources = similarGuides.map((document) => {
    console.log("%$%$%$%$%$%$%%%%");
    console.log("document", document);
    return {
      pageContent: document.pageContent,
      pageNumber: document.metadata["loc.pageNumber"],
    };
  });

  return sources;
};
