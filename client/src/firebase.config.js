// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBK4CYpmG5LJx3f5DegbD8XCsmx90njh5E",
  authDomain: "ikhlas-umhack.firebaseapp.com",
  projectId: "ikhlas-umhack",
  storageBucket: "ikhlas-umhack.firebasestorage.app",
  messagingSenderId: "536348940153",
  appId: "1:536348940153:web:2f4cb4a9b236f233a981a8",
  measurementId: "G-VWSH0BJRVR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth }; 