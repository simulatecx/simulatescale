const admin = require("firebase-admin");
const next = require("next");
const { onCall } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const { beforeUserCreated } = require("firebase-functions/v2/identity");
const { setGlobalOptions } = require("firebase-functions/v2");

admin.initializeApp();
setGlobalOptions({ region: "us-central1" });

// ==================================================================
// YOUR FUNCTIONS (ALL 2nd Gen)
// ==================================================================

exports.addAdminRole = onCall(async (request) => {
  if (request.auth.token.admin !== true) {
    throw new Error('Permission denied: Only admins can add other admins.');
  }
  const { email } = request.data;
  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { admin: true });
  return { message: `Success! ${email} has been made an admin.` };
});

exports.createUserProfile = beforeUserCreated(async (event) => {
  const { email, uid } = event.data;
  const newUser = {
    email: email, uid: uid, tier: "free",
    hasContributed: false, createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  await admin.firestore().collection("users").doc(uid).set(newUser);
});

// ==================================================================
// CODE TO SERVE YOUR NEXT.JS WEBSITE
// ==================================================================

const isDev = process.env.NODE_ENV !== "production";
const server = next({
  dev: isDev,
  // Path is now relative to the project root, not the functions folder
  conf: { distDir: ".next" }, 
});
const nextjsHandle = server.getRequestHandler();

exports.nextServer = onRequest({ maxInstances: 10 }, (req, res) => {
  return server.prepare().then(() => nextjsHandle(req, res));
});