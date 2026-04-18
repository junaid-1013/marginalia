import { NextRequest, NextResponse } from "next/server";

import { saveChatNote, getChatNote } from "@/services/db/chat";

interface IBody {
  chatId: string;
  block: string;
}
export async function POST(req: NextRequest, res: NextResponse) {
  const payload = (await req.json()) as IBody;

  const { chatId, block } = payload;

  try {
    const note = await saveChatNote({ chatId, note: block });
    return Response.json(note, {
      status: 200,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Failed to Save Note" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, res: NextResponse) {
  const url = new URL(req.url);
  // console.log({ url }, "from note route with rocket icon here ");
  const searchParams = url.searchParams;
  const chatId = searchParams.get("chatId");
  // console.log(chatId, "from note route with rocket icon here ");

  try {
    if (!chatId) {
      return Response.json({ error: "ChatId not found" }, { status: 404 });
    }

    const note = await getChatNote(chatId);

    return Response.json(note, {
      status: 200,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Failed to Get Note" }, { status: 500 });
  }
}
