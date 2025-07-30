// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBut5S8VvBSfQqnUY3EK5o8Mj1EYvZgwuQ",
  authDomain: "canteen-63ad4.firebaseapp.com",
  databaseURL: "https://canteen-63ad4-default-rtdb.firebaseio.com",
  projectId: "canteen-63ad4",
  storageBucket: "canteen-63ad4.firebasestorage.app",
  messagingSenderId: "1033055891485",
  appId: "1:1033055891485:web:a6d776609027d3164a96f4",
  measurementId: "G-DHHSFDV921"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

// Email link authentication
const actionCodeSettings = {
  // URL you want to redirect back to after email verification
  url: window.location.origin + '/login',
  // This must be true for email link sign-in
  handleCodeInApp: true,
};

// Export all Firebase services in a single export statement
export { 
  app, 
  analytics, 
  auth, 
  db, 
  database, 
  googleProvider, 
  actionCodeSettings, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink, 
  signInWithPopup 
};