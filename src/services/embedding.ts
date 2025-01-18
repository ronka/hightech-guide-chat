import { getVectorStore } from "./vector-store";

export const findRelevantContent = async (userQuery: string) => {
  const vectorStore = await getVectorStore();

  const similarGuides = await vectorStore.similaritySearch(userQuery);

  // return max of 2 sources
  const sources = similarGuides.slice(0, 2).map((document) => {
    return {
      pageContent: document.pageContent,
      pageNumber: document.metadata["loc.pageNumber"],
    };
  });

  return sources;
};
