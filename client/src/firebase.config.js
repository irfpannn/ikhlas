// Firebase configuration
import { initializeApp, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if it hasn't been initialized yet
let firebaseApp;
let db;
let auth;
let storage;

try {
  // Try to get the existing app
  firebaseApp = getApp();
} catch (e) {
  // Initialize if no app exists
  firebaseApp = initializeApp(firebaseConfig);
}

// Initialize services
db = getFirestore(firebaseApp);
auth = getAuth(firebaseApp);
storage = getStorage(firebaseApp);

export { firebaseApp, db, auth, storage }; 