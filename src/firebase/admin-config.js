import * as admin from 'firebase-admin';
// This is the critical part: we check if the app is already initialized.
// This prevents the "already exists" error in development environments.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      ),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

// Export the initialized admin instance's firestore database
const db = admin.firestore();
export { db, admin };