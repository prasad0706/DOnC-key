import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Only initialize Firebase if environment variables are present
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
// Check if Firebase app is already initialized
if (!getApps().length) {
  // Only initialize if we have the required config values
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
  } else {
    // Create a minimal app instance for development
    app = initializeApp({ projectId: 'dev-project' });
  }
} else {
  app = getApps()[0];
}

// Initialize Firebase services
const auth = getAuth(app);
const storage = getStorage(app);

export { auth, storage };
