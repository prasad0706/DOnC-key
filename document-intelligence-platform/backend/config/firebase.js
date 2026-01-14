const admin = require('firebase-admin');
require('dotenv').config();

try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
            }),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });
        console.log('Firebase Admin initialized locally');
    }
} catch (error) {
    console.error('Firebase Admin initialization error:', error);
}

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };
