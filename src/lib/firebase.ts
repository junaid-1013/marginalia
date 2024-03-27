// Import the functions you need from the SDKs you need
import { FIREBASE } from "@/constants";
import { initializeApp } from "firebase/app";
import { getStorage, ref } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
