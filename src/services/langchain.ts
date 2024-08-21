import { ConversationalRetrievalQAChain } from "langchain/chains";
import { nonStreamingModel, streamingModel } from "./llm";
import logger from "./logger";
import { QA_TEMPLATE, STANDALONE_QUESTION_TEMPLATE } from "./prompt-templates";
import { getVectorStore } from "./vector-store";
import {
  experimental_StreamData,
  LangChainStream,
  StreamingTextResponse,
} from "ai";

type callChainArgs = {
  question: string;
  chatHistory: string;
};

export async function callChain({ question, chatHistory }: callChainArgs) {
  try {
    // Open AI recommendation
    const sanitizedQuestion = question.trim().replaceAll("\n", " ");
    const vectorStore = await getVectorStore();
    const { stream, handlers } = LangChainStream({
      experimental_streamData: true,
    });
    const data = new experimental_StreamData();

    const chain = ConversationalRetrievalQAChain.fromLLM(
      streamingModel,
      vectorStore.asRetriever(),
      {
        qaTemplate: QA_TEMPLATE,
        questionGeneratorTemplate: STANDALONE_QUESTION_TEMPLATE,
        returnSourceDocuments: true, //default 4
        questionGeneratorChainOptions: {
          llm: nonStreamingModel,
        },
      }
    );

    // Question using chat-history
    // Reference https://js.langchain.com/docs/modules/chains/popular/chat_vector_db#externally-managed-memory
    chain
      .call(
        {
          question: sanitizedQuestion,
          chat_history: chatHistory,
        },
        [handlers]
      )
      .then(async (res) => {
        const sourceDocuments = res?.sourceDocuments;
        const firstTwoDocuments = sourceDocuments.slice(0, 2);
        const sources = firstTwoDocuments.map(
          ({
            pageContent,
            metadata,
          }: {
            pageContent: string;
            metadata: { "loc.pageNumber": string };
          }) => ({
            pageContent,
            pageNumber: metadata["loc.pageNumber"],
          })
        );
        logger.info("already appended ", data);
        data.append({
          sources,
        });
        data.close();
      });

    // Return the readable stream
    return new StreamingTextResponse(stream, {}, data);
  } catch (e) {
    console.error(e);
    throw new Error("Call chain method failed to execute successfully!!");
  }
}
