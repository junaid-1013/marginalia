"use server";
// TODO: make this file to the sepatation of concent like ingest, etc...

import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { AIMessage, HumanMessage, BaseMessage } from "@langchain/core/messages";
import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import { QdrantVectorStore } from "@langchain/community/vectorstores/qdrant";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { pull } from "langchain/hub";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { formatDocumentsAsString } from "langchain/util/document";
import {
  RunnableSequence,
  RunnablePassthrough,
  type Runnable,
  type RunnableConfig,
  type RunnableLike,
} from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { StreamingTextResponse, LangChainStream, Message } from "ai";
import { RetrievalQAChain } from "langchain/chains";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

import { firebaseStorage } from "@/lib/firebase";
import { getDownloadURL } from "@firebase/storage";
import { ref } from "firebase/storage";
import { OPENAI_API_KEY, QDRANT } from "@/constants";
import { db } from "@/lib/db";
import { saveMessage } from "@/services/db/chat";
// TODO: see some better ways

let qdClient: QdrantClient | null = null;
export const getQDrantClient = () => {
  if (!qdClient) {
    qdClient = new QdrantClient({
      url: QDRANT.url,
      apiKey: QDRANT.apiKey,
    });
  }

  return qdClient;
};

// METHODS
export const downloadPdf = async (path: string) => {
  try {
    // Get the download URL for the file
    const fromReference = ref(firebaseStorage, path);
    const url = await getDownloadURL(ref(fromReference));

    // Fetch the file as Blob
    const response = await fetch(url);
    const blob = await response.blob();

    // Return the Blob
    return blob;
  } catch (error) {
    // Handle any errors
    console.error("Error downloading PDF:", error);
    return null;
  }
};

interface ILoadPdfIntoVectorStoreProps {
  pdfStoragePath: string;
  collectionName: string;
}
export const loadPdfIntoVectorStore = async ({
  pdfStoragePath,
  collectionName,
}: ILoadPdfIntoVectorStoreProps) => {
  // Load docs
  const blob = await downloadPdf(pdfStoragePath);
  if (!blob) {
    console.log(
      "Failed to get the blob from the loadPdfIntoVectorStore function"
    );
    throw new Error(
      "Failed to get the blob from the loadPdfIntoVectorStore function"
    );
  }
  const loader = new WebPDFLoader(blob);
  const doc = await loader.load();
  // Split
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  const chunks = await splitter.splitDocuments(doc);

  const embeddings = new OpenAIEmbeddings();
  const qdrantClient = getQDrantClient();
  const vectorStore = await QdrantVectorStore.fromDocuments(
    chunks,
    embeddings,
    {
      client: qdrantClient,
      collectionName,
      collectionConfig: {
        vectors: {
          size: 1536,
          distance: "Cosine",
        },
      },
    }
  );

  const collection = qdrantClient.getCollection(collectionName);
  vectorStore.addDocuments(chunks);
  return collection;
  // Initialize a retriever wrapper around the vector store
  // const retriever = vectorStore.asRetriever();
  // const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");
  // const llm = new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 0 });
  // const ragChain = await createStuffDocumentsChain({
  //   llm,
  //   prompt,
  //   outputParser: new StringOutputParser(),
  // });
};

interface IChatFromExistingCollectionProps {
  collectionName: string;
  messages: Message[];
  chatId: string;
}

// TODO: make this function more better
// implement messages and context
// maintain history of the messages

export const ChatFromExistingCollection = async ({
  collectionName,
  messages,
  chatId,
}: IChatFromExistingCollectionProps) => {
  const qdrantClient = getQDrantClient();
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    new OpenAIEmbeddings(),
    {
      client: qdrantClient,
      collectionName,
    }
  );
  // const collection = await qdrantClient.getCollection(collectionName); // this is info provider

  const retriever = vectorStore.asRetriever({
    k: 3, // see it
    verbose: true,
  });

  const llm = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
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

  const { stream, handlers } = LangChainStream();

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
    (prevResult) => prevResult.question,
    retriever,
    formatDocumentsAsString,
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

  saveMessage({
    chatId,
    message: lastUserMessage as Message,
  });

  ragChain.invoke(
    {
      question: lastUserMessage?.content as string,
      chat_history: chatHistory,
    },
    {
      callbacks: [handlers],
    }
  );

  return stream;
};
