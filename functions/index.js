// Import the correct function from the 'identity' module
const { beforeUserCreated } = require("firebase-functions/v2/identity");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { logger } = require("firebase-functions"); // Import the logger

// Initialize the Firebase Admin SDK
initializeApp();

/**
 * Creates a user profile in Firestore before a new user is saved to Auth.
 */
exports.createUserProfile = beforeUserCreated(async (user) => {
  logger.info("Function triggered: createUserProfile", { uid: user.data.uid });

  try {
    const { email, uid } = user.data;

    if (!uid || !email) {
      logger.error("User data missing UID or email.", user.data);
      // You can't stop the user creation here, but you can log the error.
      return; 
    }

    const newUser = {
      email: email,
      uid: uid,
      tier: "free",
      hasContributed: false,
      createdAt: new Date(),
    };

    logger.info("Attempting to create user document with data:", newUser);

    const db = getFirestore();
    await db.collection("users").doc(uid).set(newUser);
    
    logger.info("Successfully created user document in Firestore for UID:", uid);

  } catch (error) {
    logger.error("Error creating user profile in Firestore:", error);
    // Even if this fails, the user will still be created in Auth.
    // This log is critical for debugging.
  }
});
