import admin from 'firebase-admin';
import { app } from './config'; // We can safely import the core app config

// This is your unique Project ID
const projectId = 'simulatescale';

// Check if the admin app is already initialized to prevent errors
if (!admin.apps.length) {
  try {
    // Initialize the admin app, explicitly providing the Project ID
    admin.initializeApp({
      projectId: projectId,
    });
    console.log("Firebase Admin SDK initialized successfully for project:", projectId);
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
  }
}

export default admin.firestore();