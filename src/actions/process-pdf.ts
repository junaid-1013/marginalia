"use server";
// TODO: make this file to the sepatation of concent like ingest, etc...
import * as z from "zod";

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
import { formatDocument } from "langchain/schema/prompt_template";
import { BaseCallbackConfig } from "@langchain/core/callbacks/manager";
import { Document } from "@langchain/core/documents";
import { StructuredOutputParser } from "langchain/output_parsers";
import {
  collapseDocs,
  splitListOfDocs,
} from "langchain/chains/combine_documents/reduce";
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
import { Chat } from "@prisma/client";
import { IFlashcard } from "@/types";
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
    // console.log(
    //   "Failed to get the blob from the loadPdfIntoVectorStore function"
    // );
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

export const summarizeDocument = async (chat: Chat) => {
  const qdrantClient = getQDrantClient();

  // const vectorStore = await QdrantVectorStore.fromExistingCollection(
  //   new OpenAIEmbeddings(),
  //   {
  //     client: qdrantClient,
  //     collectionName,
  //   }
  // );
  // const retriever = vectorStore.asRetriever({
  //   k: 3, // see it
  //   verbose: true,
  // });

  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    // temperature: 0.1,
    // maxTokens: 512,
    openAIApiKey: OPENAI_API_KEY,
    // streaming: true,
  });

  // Define prompt templates for document formatting, summarizing, collapsing, and combining
  const documentPrompt = PromptTemplate.fromTemplate("{pageContent}");
  const summarizePrompt = PromptTemplate.fromTemplate(
    "Summarize this content:\n\n{context}"
  );
  const collapsePrompt = PromptTemplate.fromTemplate(
    "Collapse this content:\n\n{context}"
  );
  const combinePrompt = PromptTemplate.fromTemplate(
    "Combine these summaries:\n\n{context} \n{format_instructions}"
  );

  // Wrap the `formatDocument` util so it can format a list of documents
  const formatDocs = async (documents: Document[]): Promise<string> => {
    const formattedDocs = await Promise.all(
      documents.map((doc) => formatDocument(doc, documentPrompt))
    );
    return formattedDocs.join("\n\n");
  };

  // Define a function to get the number of tokens in a list of documents
  const getNumTokens = async (documents: Document[]): Promise<number> =>
    model.getNumTokens(await formatDocs(documents));

  // Initialize the output parser
  const outputParser = new StringOutputParser();

  // parser with schema
  const summmaryOutputSchema = StructuredOutputParser.fromZodSchema(
    z.object({
      introduction: z
        .string()
        .describe(
          "Imagine you're providing an introduction to a document. Write a brief introduction that outlines the purpose and context of the document"
        ),
      abstract: z
        .string()
        .describe(
          "Craft a formal abstract for the document. Summarize the key points and main arguments in a concise format"
        ),
      // keyTakeaways: z.string().describe("key takeaways from the document"),
      // key takeaways will be a description, in bullet points, it it will be list of strings
      keyTakeaways: z
        .array(z.string())
        .describe(
          "List the key takeaways from the document. Provide a brief description for each point to highlight the main insights"
        ),
      tldr: z
        .string()
        .describe(
          "Create a TLDR summary for the document. Capture the essence of the content in a short and easily digestible format"
        ),
      //most ussed words count in the form of array of obejcts with word and count, but array lenght should not be more than 100
      mostUsedWords: z
        .array(
          z.object({
            text: z.string(),
            value: z.number(),
          })
        )
        .min(1)
        .max(100)
        .describe(
          "Select the most important words from the document for a word cloud. List them with their relevance or importance."
        ),
    })
  );

  // Define the map chain to format, summarize, and parse the document
  const mapChain = RunnableSequence.from([
    { context: async (i: Document) => formatDocument(i, documentPrompt) },
    summarizePrompt,
    model,
    outputParser,
  ]);

  // Define the collapse chain to format, collapse, and parse a list of documents
  const collapseChain = RunnableSequence.from([
    { context: async (documents: Document[]) => formatDocs(documents) },
    collapsePrompt,
    model,
    outputParser,
  ]);

  // Define a function to collapse a list of documents until the total number of tokens is within the limit
  const collapse = async (
    documents: Document[],
    options?: {
      config?: BaseCallbackConfig;
    },
    tokenMax = 4000
  ) => {
    const editableConfig = options?.config;
    let docs = documents;
    let collapseCount = 1;
    while ((await getNumTokens(docs)) > tokenMax) {
      if (editableConfig) {
        editableConfig.runName = `Collapse ${collapseCount}`;
      }
      const splitDocs = splitListOfDocs(docs, getNumTokens, tokenMax);
      docs = await Promise.all(
        splitDocs.map((doc) => collapseDocs(doc, collapseChain.invoke))
      );
      collapseCount += 1;
    }
    return docs;
  };

  // Define the reduce chain to format, combine, and parse a list of documents
  const reduceChain = RunnableSequence.from([
    {
      context: formatDocs,
      format_instructions: () => summmaryOutputSchema.getFormatInstructions(),
    },
    combinePrompt,
    model,
    summmaryOutputSchema,
  ]).withConfig({ runName: "Reduce" });

  // Define the final map-reduce chain
  const mapReduceChain = RunnableSequence.from([
    RunnableSequence.from([
      {
        doc: new RunnablePassthrough(),
        content: mapChain,
      },
      (input) =>
        new Document({
          pageContent: input.content,
          metadata: input.doc.metadata,
        }),
    ])
      .withConfig({ runName: "Summarize (return doc)" })
      .map(),
    collapse,
    reduceChain,
  ]).withConfig({ runName: "Map reduce" });

  // spliting the doc
  const blob = await downloadPdf(chat.pdfStoragePath);
  if (!blob) {
    // console.log(
    //   "Failed to get the blob from the loadPdfIntoVectorStore function"
    // );
    throw new Error(
      "Failed to get the blob from the loadPdfIntoVectorStore function"
    );
  }
  const loader = new WebPDFLoader(blob);
  const doc = await loader.load();

  // Split
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  });
  const chunks = await splitter.splitDocuments(doc);

  const result = await mapReduceChain.invoke(chunks);

  // Print the result
  // console.log(result);

  return result;
};

export const createFlashcards = async (chat: Chat) => {
  const qdrantClient = getQDrantClient();

  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    // temperature: 0.1,
    // maxTokens: 512,
    openAIApiKey: OPENAI_API_KEY,
    // streaming: true,
  });

  // Define prompt templates for document formatting, summarizing, collapsing, and combining
  const documentPrompt = PromptTemplate.fromTemplate("{pageContent}");
  const summarizePrompt = PromptTemplate.fromTemplate(
    "Imagine you're crafting flashcards to help students memorize key information effectively. Summarize the main points or interesting facts from this context:\n\n{context}"
  );

  const collapsePrompt = PromptTemplate.fromTemplate(
    "Now, condense the summarized content into a concise format suitable for flashcards:\n\n{context}"
  );

  const combinePrompt = PromptTemplate.fromTemplate(
    "You're preparing a comprehensive set of flashcards for student assessment. Integrate these condensed flashcards into an effective quiz format:\n\n{context} \n{format_instructions}"
  );

  // Wrap the `formatDocument` util so it can format a list of documents
  const formatDocs = async (documents: Document[]): Promise<string> => {
    const formattedDocs = await Promise.all(
      documents.map((doc) => formatDocument(doc, documentPrompt))
    );
    return formattedDocs.join("\n\n");
  };

  // Define a function to get the number of tokens in a list of documents
  const getNumTokens = async (documents: Document[]): Promise<number> =>
    model.getNumTokens(await formatDocs(documents));

  // Initialize the output parser
  const outputParser = new StringOutputParser();

  // parser with schema
  // const summmaryOutputSchema = StructuredOutputParser.fromNamesAndDescriptions({
  //   question: "Question or interesting knowledge of the flashcard",
  //   answer:
  //     "Answer to the question or knowledge, formatted with HTML tags such as underline and bold if needed.",
  // });

  // const summmaryOutputSchema = StructuredOutputParser.fromZodSchema(
  //   z.object({
  //     flashcards: z.array(
  //       z.object({
  //         question: z.string(),
  //         answer: z.string(),
  //       })
  //     ),
  //   })
  // );
  // const summmaryOutputSchema = StructuredOutputParser.fromZodSchema(
  //   z.object({
  //     flashcards: z.array(
  //       z.object({
  //         question: z.string(),
  //         answer: z.string(),
  //       })
  //     ),
  //   })
  // );

  const summmaryOutputSchema = StructuredOutputParser.fromZodSchema(
    z.object({
      flashcards: z.array(
        z.object({
          question: z
            .string()
            .describe("Question or knowledge of the flashcard"),
          answer: z
            .string()
            .describe("Answer or value to the question or knowledge"),
        })
      ),
      // .describe(
      //   "Array of flashcards containing question and answer pairs."
      // ),
    })
    // .describe("Schema for parsing summarized flashcard content.")
  );

  // Define the map chain to format, summarize, and parse the document
  const mapChain = RunnableSequence.from([
    { context: async (i: Document) => formatDocument(i, documentPrompt) },
    summarizePrompt,
    model,
    outputParser,
  ]);

  // Define the collapse chain to format, collapse, and parse a list of documents
  const collapseChain = RunnableSequence.from([
    { context: async (documents: Document[]) => formatDocs(documents) },
    collapsePrompt,
    model,
    outputParser,
  ]);

  // Define a function to collapse a list of documents until the total number of tokens is within the limit
  const collapse = async (
    documents: Document[],
    options?: {
      config?: BaseCallbackConfig;
    },
    tokenMax = 4000
  ) => {
    const editableConfig = options?.config;
    let docs = documents;
    let collapseCount = 1;
    while ((await getNumTokens(docs)) > tokenMax) {
      if (editableConfig) {
        editableConfig.runName = `Collapse ${collapseCount}`;
      }
      const splitDocs = splitListOfDocs(docs, getNumTokens, tokenMax);
      docs = await Promise.all(
        splitDocs.map((doc) => collapseDocs(doc, collapseChain.invoke))
      );
      collapseCount += 1;
    }
    return docs;
  };

  // Define the reduce chain to format, combine, and parse a list of documents
  const reduceChain = RunnableSequence.from([
    {
      context: formatDocs,
      format_instructions: () => summmaryOutputSchema.getFormatInstructions(),
    },
    combinePrompt,
    model,
    summmaryOutputSchema,
  ]).withConfig({ runName: "Reduce" });

  // Define the final map-reduce chain
  const mapReduceChain = RunnableSequence.from([
    RunnableSequence.from([
      {
        doc: new RunnablePassthrough(),
        content: mapChain,
      },
      (input) =>
        new Document({
          pageContent: input.content,
          metadata: input.doc.metadata,
        }),
    ])
      .withConfig({ runName: "Summarize (return doc)" })
      .map(),
    collapse,
    reduceChain,
  ]).withConfig({ runName: "Map reduce" });

  // spliting the doc
  const blob = await downloadPdf(chat.pdfStoragePath);
  if (!blob) {
    // console.log(
    //   "Failed to get the blob from the loadPdfIntoVectorStore function"
    // );
    throw new Error(
      "Failed to get the blob from the loadPdfIntoVectorStore function"
    );
  }
  const loader = new WebPDFLoader(blob);
  const doc = await loader.load();

  // Split
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  });
  const chunks = await splitter.splitDocuments(doc);

  const result = await mapReduceChain.invoke(chunks);

  // Print the result
  // console.log(result);

  return result;
};
