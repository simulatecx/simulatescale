// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { beforeUserCreated } = require("firebase-functions/v2/identity");
const { logger } = require("firebase-functions");

admin.initializeApp();

/**
 * Makes a user an admin. Can only be called by an existing admin.
 */
exports.addAdminRole = functions.https.onCall(async (data, context) => {
  // Check if request is made by an admin
  if (context.auth.token.admin !== true) {
    throw new functions.https.HttpsError(
      'permission-denied', 
      'Only admins can add other admins.'
    );
  }
  // Get user and add custom claim (admin: true)
  try {
    const user = await admin.auth().getUserByEmail(data.email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    return { message: `Success! ${data.email} has been made an admin.` };
  } catch (error) {
    logger.error("Error in addAdminRole:", error);
    throw new functions.https.HttpsError('internal', 'Error setting admin role.');
  }
});

/**
 * Creates a user profile in Firestore before a new user is saved to Auth.
 */
exports.createUserProfile = beforeUserCreated(async (event) => {
  const { email, uid } = event.data;
  
  logger.info("Function triggered: createUserProfile for UID:", uid);

  try {
    if (!uid || !email) {
      logger.error("User data missing UID or email.", event.data);
      return; 
    }

    const newUser = {
      email: email,
      uid: uid,
      tier: "free",
      hasContributed: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection("users").doc(uid).set(newUser);
    
    logger.info("Successfully created user document in Firestore for UID:", uid);
  } catch (error) {
    logger.error("Error creating user profile in Firestore:", error);
  }
});