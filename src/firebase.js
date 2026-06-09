import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: "AIzaSyBy4ZF47XJfYkP1DhOZVXUbSgGOz_M6yJU",
  authDomain: "h-project-72ffe.firebaseapp.com",
  projectId: "h-project-72ffe",
  storageBucket: "h-project-72ffe.firebasestorage.app",
  messagingSenderId: "475873471809",
  appId: "1:475873471809:web:6b2720af6d646e6c09c5c0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
