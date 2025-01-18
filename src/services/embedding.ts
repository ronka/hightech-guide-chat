import {
  EXTRA_LINKS,
  FIND_FIRST_JOB,
  LINKS_FOR_THE_BOOK,
  PURCHASE_LINKS,
} from "./prompt-templates";
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

export const getTheBook = async () => {
  return PURCHASE_LINKS;
};

export const getExtraLinks = async () => {
  return EXTRA_LINKS;
};

export const getLinksFromTheBook = async () => {
  return LINKS_FOR_THE_BOOK;
};

export const getFirstJob = async () => {
  return FIND_FIRST_JOB;
};
