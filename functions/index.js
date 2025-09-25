// functions/index.js

const {onCreate} = require("firebase-functions/v2/auth");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

// Initialize the Firebase Admin SDK
initializeApp();

/**
 * Creates a user profile in Firestore when a new user signs up.
 */
exports.createUserProfile = onCreate((user) => {
  const newUser = {
    email: user.data.email,
    uid: user.data.uid,
    tier: "free",
    hasContributed: false,
    createdAt: new Date(),
  };

  // Get a reference to the Firestore database
  const db = getFirestore();

  // Create the document in the 'users' collection
  return db.collection("users").doc(user.data.uid).set(newUser);
});