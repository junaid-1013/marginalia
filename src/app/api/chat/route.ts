import { NextRequest, NextResponse } from "next/server";
import { initializeChat } from "@/services/db/chat";

interface IBody {
  name: string;
  pdfLink: string;
  uploadPath: string;
  userId: string;
}
export async function POST(req: NextRequest, res: NextResponse) {
  const payload = (await req.json()) as IBody;

  const { name, pdfLink, userId, uploadPath } = payload;

  const chat = await initializeChat({ name, userId, pdfLink, uploadPath });
  return Response.json(chat);
}
