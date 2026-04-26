import { NextRequest, NextResponse } from "next/server";

import { loadPdfIntoVectorStore } from "@/actions/process-pdf";

interface IBody {
  pdfStoragePath: string;
  collectionName: string;
}
export async function POST(req: NextRequest, res: NextResponse) {
  const payload = (await req.json()) as IBody;
  console.log("🚀 ~ POST ~ process-document ~ payload:", payload);

  const { collectionName, pdfStoragePath } = payload;

  try {
    const collection = await loadPdfIntoVectorStore({
      pdfStoragePath,
      collectionName,
    });

    return Response.json(
      { collection },
      {
        status: 201,
      }
    );
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: "Failed to process document from /process-document route" },
      { status: 500 }
    );
  }
}
