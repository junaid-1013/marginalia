import { NextRequest, NextResponse } from "next/server";
import { initializeChat, saveMessage } from "@/services/db/chat";
import {
  ChatFromExistingCollection,
  loadPdfIntoVectorStore,
} from "@/actions/process-pdf";
import { Message, OpenAIStream, AIStream, StreamingTextResponse } from "ai";

interface IBody {
  collectionName: string;
  chatId: string;
  messages: Message[];
}
export async function POST(req: NextRequest, res: NextResponse) {
  const payload = (await req.json()) as IBody;

  const { collectionName, messages, chatId } = payload;
  // console.log({ collectionName, messages, chatId }, "Firsst Route 🌚");

  try {
    const response = await ChatFromExistingCollection({
      collectionName,
      messages,
      chatId,
    });
    return new StreamingTextResponse(response);
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: "Failed to initialize chat" },
      { status: 401 }
    );
  }
}

// TODO: see the better way to save the chat messages
