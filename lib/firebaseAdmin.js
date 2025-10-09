// lib/firebaseAdmin.js
import * as admin from 'firebase-admin';

// Use a global symbol to ensure this flag is unique across all modules.
const INITIALIZED = Symbol.for('firebase.initialized');

// Check the global flag.
if (!global[INITIALIZED]) {
  console.log('--- INITIALIZING FIREBASE ADMIN SDK ---');
  // Set the flag right away to prevent race conditions.
  global[INITIALIZED] = true;
  admin.initializeApp();
  console.log('--- INITIALIZATION COMPLETE ---');
} else {
  // This message is our litmus test. If you see this in the logs,
  // it proves the module is being loaded a second time.
  console.log('--- SKIPPING INITIALIZATION: Firebase Admin SDK already initialized. ---');
}

// Export the services.
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();