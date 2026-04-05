import { NextRequest, NextResponse } from "next/server";

import { getChatSummary, getUserChat } from "@/services/db/chat";
interface Params {
  chatId: string;
}
interface IBody {
  chatId: string;
}
export async function GET(req: NextRequest, res: NextResponse) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return Response.json({ error: "ChatId not found" }, { status: 404 });
  }

  try {
    const chat = await getUserChat(chatId);

    if (!chat) {
      return Response.json(
        { error: "Chat not found while going to summarize" },
        { status: 404 }
      );
    }
    const summary = await getChatSummary(chat.id);
    return Response.json(summary, {
      status: 200,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Failed to Summarize" }, { status: 500 });
  }
}
