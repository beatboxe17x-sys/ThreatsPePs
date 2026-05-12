import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

// YOUR Firebase project: nextgenresearch-60541
const firebaseConfig = {
  apiKey: "AIzaSyDUvhc_nD9pxBSJIG22nSPeou17EwZ_xkc",
  authDomain: "nextgenresearch-60541.firebaseapp.com",
  projectId: "nextgenresearch-60541",
  storageBucket: "nextgenresearch-60541.firebasestorage.app",
  messagingSenderId: "364842595282",
  appId: "1:364842595282:web:1ea1b191f2f978cd5ece6b",
};

// Check if Firebase is actually configured
const hasFirebaseConfig = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (hasFirebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('[Firebase] Initialized successfully');
  } catch (err) {
    console.warn('[Firebase] Initialization failed:', err);
    app = null;
    db = null;
  }
} else {
  console.log('[Firebase] No config found — running in localStorage-only mode');
}

export { db, hasFirebaseConfig };
export default app;
