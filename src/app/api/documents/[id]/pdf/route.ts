import { errorResponse, requireOwnedChat } from "@/lib/api-guard";
import { openPdf } from "@/lib/storage";

// never prerender or cache across users
export const dynamic = "force-dynamic";

/**
 * Serves the PDF of a document to its owner only.
 * The blob store can be private, so the browser never gets the blob URL: the
 * viewer loads this route, which checks ownership, reads the blob with the
 * server's token and forces inline display so `#page=N` links from citations work.
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { chat } = await requireOwnedChat(params.id);

    const pdf = await openPdf(chat.pdfLink);
    if (!pdf) {
      return Response.json({ error: "PDF not available" }, { status: 502 });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "private, max-age=3600",
    };
    if (pdf.size) headers["Content-Length"] = String(pdf.size);

    return new Response(pdf.stream, { headers });
  } catch (e) {
    return errorResponse(e, "Failed to load the PDF");
  }
}
