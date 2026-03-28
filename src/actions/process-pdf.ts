"use server";
// TODO: make this file to the sepatation of concent like ingest, etc...

import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { QdrantClient } from "@qdrant/js-client-rest";
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
} from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { StreamingTextResponse, LangChainStream, Message } from "ai";
import { RetrievalQAChain } from "langchain/chains";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
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
  chatId: string;
}
export const loadPdfIntoVectorStore = async ({
  pdfStoragePath,
  collectionName,
  chatId,
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
  console.log(
    { collectionName, messages, chatId },
    "Secondly ChatFromExistingCollection  🌞"
  );
  // const { stream, handlers } = LangChainStream();

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
    k: 5,
    verbose: true,
  });

  // const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");
  // const prompt =
  //   PromptTemplate.fromTemplate(`Answer the question based only on the following context:
  // {context}

  // Question: {question}`);
  // console.log("hosda", {
  //   prompt,
  //   // retriever,
  //   collection: collection.segments_count,
  //   collectionName,
  //   messages,
  // });
  const llm = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.1,
    maxTokens: 512,
    openAIApiKey: OPENAI_API_KEY,
    streaming: true,
  });
  // const ragChain = await createStuffDocumentsChain({
  //   llm,
  //   prompt,
  //   outputParser: new StringOutputParser(),
  // });
  // const chain = RunnableSequence.from([
  //   {
  //     context: retriever.pipe(formatDocumentsAsString),
  //     question: new RunnablePassthrough(),
  //   },

  //   prompt,
  //   llm,
  //   new StringOutputParser(),
  // ]);
  // last message is the question

  // Create a system & human prompt for the chat model
  const SYSTEM_TEMPLATE = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
{context}`;
  const messagesTemplate = [
    SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
    HumanMessagePromptTemplate.fromTemplate("{question}"),
  ];
  const prompt = ChatPromptTemplate.fromMessages(messagesTemplate);

  const chain = RunnableSequence.from([
    {
      context: retriever.pipe(formatDocumentsAsString),
      question: new RunnablePassthrough(),
    },
    prompt,
    llm,
    new StringOutputParser(),
  ]);
  const { stream, handlers } = LangChainStream();

  const lastUserMessage = messages
    .filter((message) => message.role === "user")
    .pop();
  saveMessage({
    chatId,
    message: lastUserMessage as Message,
  });

  chain.invoke(lastUserMessage?.content, {
    callbacks: [handlers],
  });

  return stream;
};
