import { NextRequest, NextResponse } from "next/server";

import {
  getChatFlashcards,
  getUserChat,
  saveFlashcards,
  saveMessage,
  saveSummary,
} from "@/services/db/chat";
import { Message } from "ai";
import { summarizeDocument, createFlashcards } from "@/actions/process-pdf";

interface IBody {
  chatId: string;
}
export async function POST(req: NextRequest, res: NextResponse) {
  const payload = (await req.json()) as IBody;

  const { chatId } = payload;
  // console.log({ chatId }, "from NEW route START emoji here  🚀");

  try {
    const chat = await getUserChat(chatId);
    // console.log({ chat }, "from NEW route");
    if (!chat) {
      return Response.json(
        { error: "Chat not found while going to summarize" },
        { status: 404 }
      );
    }
    const { flashcards } = await createFlashcards(chat);
    // console.log("GREEN CHECK icon here means COMPLETED FLASHCARD 🚀");
    await saveFlashcards({ chatId, flashcards });
    return Response.json(flashcards, {
      status: 200,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Failed to Summarize" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, res: NextResponse) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return Response.json({ error: "ChatId not found" }, { status: 404 });
  }

  try {
    const flashcards = await getChatFlashcards(chatId);
    // console.log("GREEN CHECK icon here means GETTING FLASHCARD 🚀", {
    //   flashcards,
    //   chatId,
    // });

    return Response.json(flashcards, {
      status: 200,
    });
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: "Failed to get flashcards" },
      { status: 500 }
    );
  }
}
