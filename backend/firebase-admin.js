// const admin = require("firebase-admin");

// // Initialize Firebase Admin SDK
// admin.initializeApp({
//   credential: admin.credential.applicationDefault(), // Uses service account
//   storageBucket: 'builderpro-94410.firebasestorage.app', // Ensure this is set correctly in your .env file
// });

// // Get reference to Firebase Storage
// const bucket = admin.storage().bucket();

// module.exports = { bucket };

const admin = require("firebase-admin");
const path = require("path");

// Load service account key
const serviceAccount = require('./firebase-admin.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'builderpro-94410.firebasestorage.app',
});

// Get reference to Firebase Storage
const bucket = admin.storage().bucket();

module.exports = { bucket };
