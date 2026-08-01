/* ── DSU KnotSpot — Firebase Google Auth + Local Fallback ── */

/* ── STEP 1: Paste your Firebase config here after creating project ── */
const DSU_FIREBASE_CONFIG = {
  apiKey: "",            // paste from Firebase Console
  authDomain: "",        // e.g. dsu-knotspot.firebaseapp.com
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const FIREBASE_READY = DSU_FIREBASE_CONFIG.apiKey.length > 0;
