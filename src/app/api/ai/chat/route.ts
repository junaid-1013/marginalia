import { NextRequest, NextResponse } from "next/server";

import { loadPdfIntoQdrant } from "@/actions/process-pdf";
import { qdClient } from "@/lib/qdrant";

export async function GET(req: NextRequest, res: NextResponse) {
  const collections = await qdClient.getCollections();
  return Response.json(collections);
}

export async function POST(req: NextRequest, res: NextResponse) {
  const body = await req.json();
  try {
    if (!body.uploadPath) {
      throw new Error("uploadPath is required");
    }
    const docs = await loadPdfIntoQdrant(body.uploadPath);
    return Response.json({ length: docs.length, docs });
  } catch (e) {
    throw new Error("Failed to load pdf into qdrant");
  }
}
