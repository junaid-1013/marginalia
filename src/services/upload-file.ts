import { FileWithPath } from "react-dropzone";
import { upload } from "@vercel/blob/client";

import { BLOB_ACCESS } from "@/lib/blob-access";

export interface IUploadedFile {
  url: string;
  pathname: string;
}

/**
 * Uploads the PDF straight from the browser to Vercel Blob.
 * The server only issues a short lived token (see /api/blob/upload),
 * so the file never passes through a serverless function body limit.
 */
export const uploadFile = async ({
  file,
  userId,
  onProgress,
}: {
  file: FileWithPath;
  userId: string;
  /** 0 to 100 while the file is on its way */
  onProgress?: (percentage: number) => void;
}): Promise<IUploadedFile> => {
  // userId/uuid.pdf: unique per upload, and namespaced per user
  const pathname = `${userId}/${crypto.randomUUID()}.pdf`;
  const blob = await upload(pathname, file, {
    access: BLOB_ACCESS,
    contentType: "application/pdf",
    handleUploadUrl: "/api/blob/upload",
    onUploadProgress: ({ percentage }) => onProgress?.(Math.round(percentage)),
  });
  return { url: blob.url, pathname: blob.pathname };
};
