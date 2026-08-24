// 'private' (default) or 'public': must match how the Vercel Blob store was
// created. NEXT_PUBLIC_ because the browser upload needs it too.
// (kept import free so the client bundle does not pull in the server SDK)
export const BLOB_ACCESS: "public" | "private" =
  process.env.NEXT_PUBLIC_BLOB_ACCESS === "public" ? "public" : "private";
