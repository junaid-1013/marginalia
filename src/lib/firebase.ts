// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref } from "firebase/storage";

import { FIREBASE } from "@/constants";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: FIREBASE.apiKey,
  authDomain: FIREBASE.authDomain,
  projectId: FIREBASE.projectId,
  storageBucket: FIREBASE.storageBucket,
  messagingSenderId: FIREBASE.messagingSenderId,
  appId: FIREBASE.appId,
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
// export const firebaseStorage = getStorage(firebaseApp);
export const firebaseStorage = getStorage(
  firebaseApp,
  "gs://innovated-b9c9a.appspot.com"
);
export const firebaseStorageRef = ref(firebaseStorage);

export const uploadsRef = ref(firebaseStorage, "/uploads/");
