const admin = require('firebase-admin');

// 🔥 Use environment variables for production, fallback to local JSON for development
let serviceAccount;

if (process.env.NODE_ENV === 'production') {
  // Production: Use base64 encoded credentials
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
    serviceAccount = JSON.parse(decoded);
    console.log('🔥 Using Firebase credentials from base64 env var');
  } else {
    throw new Error('❌ FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is not set');
  }
} else {
  // Development: Use local JSON file
  const path = require('path');
  serviceAccount = require(path.join(__dirname, '../../serviceAccountKey.json'));
  console.log('🔥 Using Firebase credentials from local file');
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