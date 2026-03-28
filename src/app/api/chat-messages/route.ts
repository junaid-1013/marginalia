import { NextRequest, NextResponse } from "next/server";

import { getChatMessages } from "@/services/db/chat";

interface IBody {
  chatId: string;
}
export async function POST(req: NextRequest, res: NextResponse) {
  const payload = (await req.json()) as IBody;

  const { chatId } = payload;
  try {
    const messages = await getChatMessages(chatId);
    return Response.json(messages, {
      status: 201,
    });
  } catch (e: any) {
    console.error("error from thte route junaid", e);
    return Response.json({ error: e?.message as string }, { status: 500 });
  }
}
