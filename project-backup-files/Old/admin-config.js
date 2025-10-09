import admin from 'firebase-admin';

// In the deployed environment, the app is already initialized in functions/index.js.
// This code ensures we use that existing instance.
// For local development, it relies on the GOOGLE_APPLICATION_CREDENTIALS env var.
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth, admin };