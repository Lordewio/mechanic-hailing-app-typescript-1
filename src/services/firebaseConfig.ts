// src/services/firebaseConfig.ts
import firebase from "@react-native-firebase/app";

// IMPORTANT: Replace with your actual Firebase project configuration
// You can get this from your Firebase project settings
// Optionally define an interface for stricter config typing
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string; // Optional
}

const firebaseConfig: FirebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  // measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized.");
} else {
  firebase.app(); // if already initialized, use that one
  console.log("Firebase already initialized.");
}

// Export the initialized app instance (optional, often modules import specific services like auth, firestore directly)
export default firebase;

