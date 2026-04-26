import { NextRequest, NextResponse } from "next/server";

import { initializeChat } from "@/services/db/chat";

interface IBody {
  name: string;
  pdfLink: string;
  pdfStoragePath: string;
  userId: string;
}
export async function POST(req: NextRequest, res: NextResponse) {
  const payload = (await req.json()) as IBody;

  console.log("🚀 ~ POST ~ init-chat ~ payload:", payload);

  const { name, pdfLink, userId, pdfStoragePath } = payload;
  try {
    const chat = await initializeChat({
      name,
      userId,
      pdfLink,
      pdfStoragePath,
    });

    console.log("🚀 ~ POST ~ init-chat ~ chat:", chat);

    return Response.json(
      { chat },
      {
        status: 201,
      }
    );
  } catch (e: any) {
    console.log("🚨 ~ POST ~ init-chat ~ e:", e);
    return Response.json({ error: e?.message as string }, { status: 500 });
  }
}
