import { NextRequest, NextResponse } from "next/server";
import { initializeChat } from "@/services/db/chat";

interface IBody {
  name: string;
  pdfUrl: string;
  userId: string;
}
export async function POST(req: NextRequest, res: NextResponse) {
  const payload = (await req.json()) as IBody;

  const { name, pdfUrl, userId } = payload;

  const chat = await initializeChat({ name, userId, pdfUrl });
  return Response.json(chat);
}
