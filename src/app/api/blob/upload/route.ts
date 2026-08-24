import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

import { auth } from "@/auth";
import { ApiError } from "@/lib/api-guard";
import { errorFields, logger } from "@/lib/logger";

const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) {
          throw new ApiError(401, "Please log in again");
        }
        // the client must upload into its own namespace, as a pdf
        if (!pathname.startsWith(`${userId}/`) || !pathname.endsWith(".pdf")) {
          throw new ApiError(400, "Invalid upload path");
        }
        return {
          allowedContentTypes: ["application/pdf"],
          maximumSizeInBytes: MAX_PDF_SIZE_BYTES,
          addRandomSuffix: true,
        };
      },
      // Not used: the form registers the document itself after the upload.
      // (This callback cannot reach localhost during development anyway.)
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (e) {
    // the browser SDK only shows "Failed to retrieve the client token", so keep the reason in the server log
    logger.error("blob upload token failed", errorFields(e));
    return NextResponse.json(
      { error: (e as Error).message },
      { status: e instanceof ApiError ? e.status : 400 }
    );
  }
}
