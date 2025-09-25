// src/firebase/config.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANdQS-ZonUyHfYKJanl7NowF1j2ZuktRc",
  authDomain: "simulatescale.firebaseapp.com",
  projectId: "simulatescale",
  storageBucket: "simulatescale.firebasestorage.app",
  messagingSenderId: "735964366465",
  appId: "1:735964366465:web:ede1611f7245144ce52f80",
  measurementId: "G-QS03V0X324"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // You can keep this or remove if not needed for MVP

// Initialize and export Firebase services for use in other parts of our app
export const db = getFirestore(app);
export const auth = getAuth(app);