"use server";

import { db } from "@/lib/db";
import { cache } from "react";

interface IProps {
  userId: string;
  name: string;
  pdfLink: string;
  uploadPath: string;
}

export const initializeChat = async ({
  userId,
  name,
  pdfLink,
  uploadPath,
}: IProps) => {
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
        uploadPath,
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
