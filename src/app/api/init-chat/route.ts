import { NextRequest, NextResponse } from "next/server";
import { initializeChat } from "@/services/db/chat";
import { loadPdfIntoVectorStore } from "@/actions/process-pdf";

interface IBody {
  name: string;
  pdfLink: string;
  pdfStoragePath: string;
  userId: string;
}
export async function POST(req: NextRequest, res: NextResponse) {
  const payload = (await req.json()) as IBody;

  const { name, pdfLink, userId, pdfStoragePath } = payload;

  try {
    const chat = await initializeChat({
      name,
      userId,
      pdfLink,
      pdfStoragePath,
    });

    if (!chat) {
      return Response.json(
        { error: "Failed to initialize chat" },
        { status: 401 }
      );
    }

    const document = await loadPdfIntoVectorStore({
      pdfStoragePath,
      collectionName: chat.collectionName,
    });

    return Response.json({ chat, document });
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: "Failed to initialize chat" },
      { status: 401 }
    );
  }
}
