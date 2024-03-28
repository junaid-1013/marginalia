"use server";

import { db } from "@/lib/db";
import { cache } from "react";

interface IProps {
  userId: string;
  name: string;
  pdfUrl: string;
}

export const initializeChat = async ({ userId, name, pdfUrl }: IProps) => {
  try {
    const chat = await db.chat.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        name,
        pdfUrl,
      },
    });
    return chat;
  } catch (e) {
    console.log(e);
    return null;
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
    console.log({ chats });
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
    console.log({ chat });
    return chat;
  } catch (e) {
    console.log(e);
    return null;
  }
});
