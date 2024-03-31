"use server";

import { WebPDFLoader } from "langchain/document_loaders/web/pdf";

import { firebaseStorage } from "@/lib/firebase";
import { getDownloadURL } from "@firebase/storage";
import { ref } from "firebase/storage";
// TODO: see some better ways

// export const downloadFile = (path: string) => {
//   const fromReference = ref(firebaseStorage, path);
//   getBlob(fromReference)
//     .then((blob) => {
//       console.log("blob: ", blob);
//     })
//     .catch((error) => {
//       console.log("error downloading file: ", error);
//     });
// };

// using async await

// FUNCTION IF PDF FILE DOWNLOAD in the temp folder, so we will use fs/pdf

// export const downloadFile = async (path: string) => {
//   const fromReference = ref(firebaseStorage, path);
//   try {
//     const blob = await getBlob(fromReference);
//     const arrayBuffer = await blob.arrayBuffer();
//     const tempPath = `${os.tmpdir()}/${path}`;
//     fs.writeFileSync(tempPath, Buffer.from(arrayBuffer));
//     // TODO:save this into the temp folder
//     console.log("downloadPdf - tempPath: ", tempPath);
//     console.log("downloadPdf - blob: ", blob);
//     return tempPath;
//   } catch (error) {
//     console.log("error downloading file: ", error);
//   }
// };

// FUNCTION if we want to download the file and want to load that blob, so we will use web/pdf
// export const downloadFile = async (path: string) => {
//   console.log("welcome in downloadfile FM");
//   const fromReference = ref(firebaseStorage, path);
//   try {
//     const stream = getStream(fromReference);
//     console.log("stream: ", stream);
//     const tempFilePath = `${os.tmpdir()}/${path}`;
//     console.log("tempFilePath: ", tempFilePath);
//     await fs.promises.mkdir(`${os.tmpdir()}/uploads`, { recursive: true });

//     const writeStream = fs.createWriteStream(tempFilePath);
//     console.log("writeStream: ", writeStream);
//     stream.pipe(writeStream);

//     await new Promise((resolve, reject) => {
//       writeStream.on("finish", resolve);
//       writeStream.on("error", reject);
//     });
//     console.log("File saved to:", tempFilePath);
//     return tempFilePath;
//     // make this stream to blob
//   } catch (error) {
//     console.log("error downloading file: ", error);
//   }
// };

export const downloadPdf = async (path: string) => {
  try {
    // Get the download URL for the file
    const fromReference = ref(firebaseStorage, path);
    const url = await getDownloadURL(ref(fromReference));

    // Fetch the file as Blob
    const response = await fetch(url);
    const blob = await response.blob();

    // Return the Blob
    return blob;
  } catch (error) {
    // Handle any errors
    console.error("Error downloading PDF:", error);
    return null;
  }
};
export const loadPdfIntoQdrant = async (path: string) => {
  // console.log("entered inside loadpdfinto qdrant", path);
  const blob = await downloadPdf(path);
  // console.log("exit loadpdfinto qdrant blob: ", blob);
  if (!blob) {
    throw new Error("Failed to download blob");
  }
  // console.log("SUBHANALLAHI WAL HAMDULILLAH", blob);

  const loader = new WebPDFLoader(blob);
  const docs = await loader.load();
  console.log({ docs, length: docs.length });
  return docs;
  // const loader = new PDFLoader(filePath);
  // const docs = await loader.load();

  // console.log({ docs, length: docs.length });
  // return docs;
};
// export const loadPdfIntoQdrant = async (path: string) => {
//   console.log("entered inside loadpdfinto qdrant", path);
//   const filePath = await downloadPdf(path);
//   console.log("exit loadpdfinto qdrant filePath: ", filePath);
//   if (!filePath) {
//     throw new Error("Failed to download file");
//   }
//   // const loader = new PDFLoader(filePath);
//   // const docs = await loader.load();

//   // console.log({ docs, length: docs.length });
//   // return docs;
// };
