"use server";

import { cache } from "react";
import { PrismaClient, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

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
