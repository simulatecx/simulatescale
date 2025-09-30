// set-admin.js
const admin = require('firebase-admin');

// IMPORTANT: Update this path to where you downloaded your service account key file.
// Remember to use double backslashes (\\) on Windows.
const serviceAccount = require('./serviceAccountKey.json');

// IMPORTANT: Replace this with the email of the user you already created in your app.
const email = 'admin@simulatecx.com';

// --- No changes needed below this line ---
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  admin.auth().getUserByEmail(email)
    .then(user => {
      return admin.auth().setCustomUserClaims(user.uid, { admin: true });
    })
    .then(() => {
      console.log(`✅ Success! ${email} is now an admin.`);
      console.log("You can verify this in the Firebase Console > Authentication tab.");
      process.exit(0);
    })
    .catch(error => {
      if (error.code === 'auth/user-not-found') {
        console.error(`❌ Error: User with email "${email}" not found in Firebase Authentication.`);
        console.error("Please sign up with this email in your app first, then re-run this script.");
      } else {
        console.error('Error setting admin claim:', error);
      }
      process.exit(1);
    });
} catch(error) {
    console.error("❌ Error initializing Firebase Admin. Is the path to your service account key correct?", error.message);
    process.exit(1);
}