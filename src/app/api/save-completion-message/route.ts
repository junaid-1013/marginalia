import { NextRequest, NextResponse } from "next/server";

import { saveMessage } from "@/services/db/chat";
import { Message } from "ai";

interface IBody {
  chatId: string;
  message: Message;
}
export async function POST(req: NextRequest, res: NextResponse) {
  const payload = (await req.json()) as IBody;

  const { chatId, message } = payload;

  try {
    const savedChat = await saveMessage({ chatId, message });

    return Response.json(
      {
        chat: savedChat,
      },
      {
        status: 201,
      }
    );
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: "Failed to save chat messages" },
      { status: 500 }
    );
  }
}
