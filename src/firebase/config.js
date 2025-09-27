import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyANdQS-ZonUyHfYKJanl7NowF1j2ZuktRc",
  authDomain: "simulatescale.firebaseapp.com",
  projectId: "simulatescale",
  storageBucket: "simulatescale.appspot.com",
  messagingSenderId: "735964366465",
  appId: "1:735964366465:web:ede1611f7245144ce52f80",
  measurementId: "G-QS03V0X324"
};

// Initialize Firebase App (safe on server and client)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };