import { NextRequest, NextResponse } from "next/server";
import { initializeChat } from "@/services/db/chat";
import {
  ChatFromExistingCollection,
  loadPdfIntoVectorStore,
} from "@/actions/process-pdf";
import { Message, OpenAIStream, AIStream, StreamingTextResponse } from "ai";

interface IBody {
  collectionName: string;
  messages: Message[];
}
export async function POST(req: NextRequest, res: NextResponse) {
  const payload = (await req.json()) as IBody;

  const { collectionName, messages } = payload;

  try {
    const response = await ChatFromExistingCollection({
      collectionName,
      messages,
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
