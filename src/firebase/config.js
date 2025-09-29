import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your original, working credentials
const firebaseConfig = {
  apiKey: "AIzaSyANdQS-ZonUyHfYKJanl7NowF1j2ZuktRc",
  authDomain: "simulatescale.firebaseapp.com",
  projectId: "simulatescale",
  storageBucket: "simulatescale.appspot.com",
  messagingSenderId: "735964366465",
  appId: "1:735964366465:web:ede1611f7245144ce52f80",
  measurementId: "G-QS03V0X324"
};

// This line is identical to your original file
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ---- NEW AND NECESSARY PART ----
// We initialize the database and auth services here
const db = getFirestore(app);
const auth = getAuth(app);

// We export db and auth so other components can import them
export { app, db, auth };