// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDS0rzOPRcJEDZrMhujbaj2W0T9ocRy0Ls",
  authDomain: "academaigpt.firebaseapp.com",
  projectId: "academaigpt",
  storageBucket: "academaigpt.firebasestorage.app",
  messagingSenderId: "502915466524",
  appId: "1:502915466524:web:c1a9ce5839407462ac26d9",
  measurementId: "G-WS0GFSPKZB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export {app};
