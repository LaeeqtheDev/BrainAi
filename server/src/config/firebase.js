const admin = require('firebase-admin');
const path = require('path');

// Load service account key
const serviceAccount = require(path.join(__dirname, '../../serviceAccountKey.json'));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'mental-health-tracker-584ef',
});

// Initialize Firestore
const db = admin.firestore();
const auth = admin.auth();

console.log('Firebase Admin initialized');

module.exports = { db, auth, admin };