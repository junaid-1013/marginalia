import { FileWithPath } from "react-dropzone";

import { firebaseStorage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

export const uploadFileFirebase = async (
  file: FileWithPath
): Promise<string> => {
  console.log("🚀 ~ uploadFileFirebase ~ file:", file);
  const metadata = {
    contentType: file.type,
  };
  const storageRef = ref(firebaseStorage, "uploads/" + file.name);
  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        // Handle errors during upload
        reject(error);
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            // Resolve the promise with the download URL
            console.log(
              "🚀 ~ service ~ uploadFileFirebase ~ downloadURL:",
              downloadURL
            );
            resolve(downloadURL);
          })
          .catch((error) => {
            // Handle errors while getting download URL
            console.log("🚨 ~ service ~ uploadFileFirebase ~ error:", error);
            reject(error);
          });
      }
    );
  });
};
