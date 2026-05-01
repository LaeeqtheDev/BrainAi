const admin = require('firebase-admin');

// 🔥 Use environment variables for production, fallback to local JSON for development
let serviceAccount;

if (process.env.NODE_ENV === 'production') {
  // Production: Use environment variables
  serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Fix escaped newlines
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CERT_URL,
    universe_domain: "googleapis.com"
  };
} else {
  // Development: Use local JSON file
  const path = require('path');
  serviceAccount = require(path.join(__dirname, '../../serviceAccountKey.json'));
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'mental-health-tracker-584ef',
  });
}

const db = admin.firestore();
const auth = admin.auth();

console.log('✅ Firebase Admin initialized');

module.exports = { db, auth, admin };