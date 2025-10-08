import admin from 'firebase-admin';

// The app is initialized ONCE in functions/index.js for production.
// This file is used by the Next.js pages that run inside that function.
// We just need to ensure we get the initialized instance.

if (!admin.apps.length) {
  // This fallback is for your LOCAL environment (`npm run dev`).
  // It will use the service account key file.
  // In production, this block is skipped because the app is already initialized.
  try {
    const serviceAccount = require('../../serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (e) {
    console.error('Admin SDK initialization error:', e);
    // If that fails, try initializing without credentials for the production case.
    admin.initializeApp();
  }
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth, admin };