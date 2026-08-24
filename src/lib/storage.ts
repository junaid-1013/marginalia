import { get } from "@vercel/blob";

import { BLOB_ACCESS } from "@/lib/blob-access";

const isBlobHost = (host: string) => host.endsWith(".blob.vercel-storage.com");

// local test servers are only accepted while developing
const isDevLocal = (url: URL) =>
  process.env.NODE_ENV !== "production" &&
  (url.hostname === "localhost" || url.hostname === "127.0.0.1");

/**
 * The server fetches `pdfLink` later, so it must really be the blob that was
 * uploaded under `pathname`, never an arbitrary URL (SSRF).
 */
export const isTrustedPdfUrl = (link: string, pathname: string) => {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return false;
  }
  if (isDevLocal(url)) return true;
  return (
    url.protocol === "https:" &&
    isBlobHost(url.hostname) &&
    decodeURIComponent(url.pathname) === `/${pathname}`
  );
};

/** Opens the stored PDF as a stream, with credentials when the store is private. */
export const openPdf = async (
  link: string
): Promise<{ stream: ReadableStream<Uint8Array>; size: number | null } | null> => {
  const url = new URL(link);
  if (isDevLocal(url)) {
    const res = await fetch(link);
    if (!res.ok || !res.body) return null;
    return { stream: res.body, size: Number(res.headers.get("content-length")) || null };
  }
  const result = await get(link, { access: BLOB_ACCESS });
  if (!result || result.statusCode !== 200) return null;
  return { stream: result.stream, size: result.blob.size };
};
