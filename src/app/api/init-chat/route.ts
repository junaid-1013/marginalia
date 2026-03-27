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

  const { name, pdfLink, userId, pdfStoragePath } = payload;
  try {
    const chat = await initializeChat({
      name,
      userId,
      pdfLink,
      pdfStoragePath,
    });

    return Response.json(
      { chat },
      {
        status: 201,
      }
    );
  } catch (e: any) {
    console.error("error from thte route junaid", e);
    return Response.json({ error: e?.message as string }, { status: 500 });
  }
}
