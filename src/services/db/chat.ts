"use server";

import { cache } from "react";
import { PrismaClient, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { Message } from "ai";
import { IFlashcard, ISummary } from "@/types";

interface IProps {
  userId: string;
  name: string;
  pdfLink: string;
  pdfStoragePath: string;
}

export const initializeChat = async ({
  userId,
  name,
  pdfLink,
  pdfStoragePath,
}: IProps) => {
  const collectionName = `${name.toLowerCase().replace(/\s/g, "-")}-${userId}`;
  try {
    const chat = await db.chat.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        name,
        pdfLink,
        pdfStoragePath,
        collectionName,
      },
    });
    return chat;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        throw new Error("Chat Name already exists, it must be unique.");
        // return {
        //   status: 400,
        //   code: e.code,
        //   message: "Chat Name already existsc, it must be unique.",
        // };
      } else {
        throw new Error(e.message);
        // return {
        //   stutes: 500,
        //   code: e.code,
        //   message: e.message,
        // };
      }
    }
  }
};

export const getUserChats = cache(async (userId: string) => {
  "use server";
  try {
    const chats = await db.chat.findMany({
      where: {
        userId,
      },
    });
    // console.log({ chats });
    return chats;
  } catch (e) {
    console.log(e);
    return null;
  }
});

export const getUserChat = cache(async (chatId: string) => {
  "use server";
  try {
    const chat = await db.chat.findUnique({
      where: {
        id: chatId,
      },
    });
    return chat;
  } catch (e) {
    console.log(e);
    return null;
  }
});

// export const getCollectionNameByChatId = cache(async (chatId: string) => {
//   "use server";
//   try {
//     const chat = await db.chat.findUnique({
//       where: {
//         id: chatId,
//       },
//     });
//     return chat?.collectionName;
//   } catch (e) {
//     console.log(e);
//     return null;
//   }
// });

export const saveMessage = async ({
  chatId,
  message,
}: {
  chatId: string;
  message: Message;
}) => {
  "use server";
  try {
    console.log({ chatId, message }, "lastly fromm the db service🚀");
    const chat = await db.chat.findUnique({
      where: {
        id: chatId,
      },
    });
    if (!chat) {
      throw new Error("Chat not found");
    }
    const updatedChat = await db.chat.update({
      where: {
        id: chatId,
      },
      data: {
        messages: {
          create: {
            // destructureing becuase of the BaseMessage of the Llangchain when passing in the history chain
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            role: message.role,
          },
        },
      },
    });

    return updatedChat;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to save chat messages");
  }
};

export const getChatMessages = async (chatId: string) => {
  "use server";
  try {
    const chat = await db.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        messages: true,
      },
    });
    return chat?.messages;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to fetch chat messages");
  }
};

// save the summary of the chat by chatId
interface ISaveSummary {
  chatId: string;
  summary: ISummary;
}
// TODO: when createing again the Summary, the one to one, do problem with the chatId for the unique id, so solve that issue
export const saveSummary = async ({ chatId, summary }: ISaveSummary) => {
  "use server";
  console.log({ chatId, summary }, "SAVING 🚀");

  if (!chatId || !summary) {
    throw new Error("Invalid chatId or summary");
  }
  try {
    // Ensure that the chat exists before updating the summary
    const chat = await db.chat.findUnique({
      where: {
        id: chatId,
      },
    });

    if (!chat) {
      throw new Error("Chat not found");
    }

    const updatedChat = await db.chat.update({
      where: {
        id: chatId,
      },
      data: {
        summary: {
          create: {
            introduction: summary.introduction,
            abstract: summary.abstract,
            keyTakeaways: summary.keyTakeaways,
            tldr: summary.tldr,
            mostUsedWords: {
              createMany: {
                skipDuplicates: true,
                data: summary.mostUsedWords.map((word) => ({
                  text: word.text,
                  value: word.value,
                })),
              },
            },
          },
        },
      },
    });

    return updatedChat.id;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to save chat summary");
  }
};
// getChatSummary
export const getChatSummary = async (chatId: string) => {
  "use server";
  try {
    const chat = await db.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        summary: {
          include: {
            mostUsedWords: true,
          },
        },
      },
    });
    return chat?.summary;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to fetch chat summary");
  }
};

export const saveFlashcards = async ({
  chatId,
  flashcards,
}: {
  chatId: string;
  flashcards: IFlashcard[];
}) => {
  try {
    console.log({ chatId, flashcards }, "from the db service 🚀");
    if (!chatId || !flashcards) {
      throw new Error("Invalid chatId or flashcards");
    }
    const updatedChat = await db.chat.update({
      where: {
        id: chatId,
      },
      data: {
        flashcards: {
          createMany: {
            data: flashcards.map((flashcard) => ({
              question: flashcard.question,
              answer: flashcard.answer,
            })),
          },
        },
      },
    });
    return updatedChat.id;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to save chat flashcards");
  }
};

export const getChatFlashcards = async (chatId: string) => {
  try {
    const fcs = await db.flashcard.findMany({
      where: {
        chatId,
      },
    });
    return fcs;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to fetch chat flashcards");
  }
};
