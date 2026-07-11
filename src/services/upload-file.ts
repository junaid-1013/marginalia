import { FileWithPath } from "react-dropzone";
import { upload } from "@vercel/blob/client";

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
}: {
  file: FileWithPath;
  userId: string;
}): Promise<IUploadedFile> => {
  // userId/uuid.pdf: unique per upload, and namespaced per user
  const pathname = `${userId}/${crypto.randomUUID()}.pdf`;
  const blob = await upload(pathname, file, {
    access: "public",
    contentType: "application/pdf",
    handleUploadUrl: "/api/blob/upload",
  });
  return { url: blob.url, pathname: blob.pathname };
};
