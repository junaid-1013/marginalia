import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, HumanMessage, BaseMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { LangChainStream, Message } from "ai";

import { OPENAI_API_KEY } from "@/constants";
import { CHAT_MODEL } from "@/lib/ai/models";
import { formatChunksAsContext, searchChunks } from "@/lib/ai/retrieval";
import { saveMessage } from "@/services/db/chat";

interface IStreamAnswerProps {
  messages: Message[];
  chatId: string;
}

// TODO: make this function more better
// implement messages and context
// maintain history of the messages

export const streamAnswer = async ({
  messages,
  chatId,
}: IStreamAnswerProps) => {
  const llm = new ChatOpenAI({
    modelName: CHAT_MODEL,
    temperature: 0.1,
    maxTokens: 512,
    openAIApiKey: OPENAI_API_KEY,
    streaming: true,
  });

  // XYZ with the messages
  const lastUserMessage = messages
    .filter((message) => message.role === "user")
    .pop();

  const messagesCopy = [...messages];
  messagesCopy.pop();

  // const lastThreeMessages = messagesCopy.slice(-3);
  const chatHistory = messagesCopy.map((message) => {
    if (message.role === "user") {
      return new HumanMessage(message.content);
    }
    return new AIMessage(message.content);
  });

  // the assistant answer is saved here, on the server, once streaming completes
  const { stream, handlers } = LangChainStream({
    onCompletion: async (completion) => {
      try {
        await saveMessage({ chatId, role: "assistant", content: completion });
      } catch (e) {
        console.error("Failed to save assistant message", e);
      }
    },
  });

  // RAG CHAIN 🤖
  const qaSystemPrompt = `You are an assistant for question-answering tasks from the document as an instructor of the document.
  Use the following pieces of retrieved context to answer the question, also get an idea about the user question from the chat history.
  If you don't know the answer, just say that you don't know.

  {context}`;

  const qaPrompt = ChatPromptTemplate.fromMessages([
    ["system", qaSystemPrompt],
    new MessagesPlaceholder("chat_history"),
    ["human", "{question}"],
  ]);

  interface IRunnableArg {
    question: string;
    chat_history: BaseMessage[];
  }

  const retrieverChain = RunnableSequence.from([
    (prevResult) => prevResult.question as string,
    async (question: string) =>
      formatChunksAsContext(await searchChunks({ chatId, query: question, k: 4 })),
  ]);
  const ragChain = RunnableSequence.from([
    {
      context: retrieverChain,
      question: (args) => args.question,
      chat_history: (args) => args.chat_history,
    },
    qaPrompt,
    llm,
    new StringOutputParser(),
  ]);

  if (!lastUserMessage) {
    throw new Error("No user message to answer");
  }

  await saveMessage({
    chatId,
    role: "user",
    content: lastUserMessage.content,
  });

  // errors are forwarded to the stream by the handlers, this only stops
  // them from surfacing as unhandled promise rejections
  ragChain
    .invoke(
      {
        question: lastUserMessage.content,
        chat_history: chatHistory,
      },
      {
        callbacks: [handlers],
      }
    )
    .catch((e) => console.error("RAG chain failed", e));

  return stream;
};
