import { NextRequest, NextResponse } from "next/server";

import { getUserChat, saveMessage } from "@/services/db/chat";
import { Message } from "ai";
import { summarizeDocument } from "@/actions/process-pdf";

interface IBody {
  chatId: string;
}
export async function POST(req: NextRequest, res: NextResponse) {
  const payload = (await req.json()) as IBody;

  const { chatId } = payload;
  console.log({ chatId }, "from NEW route START emoji here  🚀");

  try {
    const chat = await getUserChat(chatId);
    console.log({ chat }, "from NEW route");
    if (!chat) {
      return Response.json(
        { error: "Chat not found while going to summarize" },
        { status: 404 }
      );
    }

    const summary = await summarizeDocument(chat);

    return Response.json(summary, {
      status: 200,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Failed to Summarize" }, { status: 500 });
  }
}
