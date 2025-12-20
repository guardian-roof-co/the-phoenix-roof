
// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app"; // Commented out to fix import errors
// import { getFirestore } from "firebase/firestore"; // Commented out to fix import errors

// --- ACTION REQUIRED: PASTE YOUR FIREBASE CONFIG HERE ---
// 1. Go to console.firebase.google.com
// 2. Create a project (or use existing)
// 3. Go to Project Settings > General > "Your apps" > Web App
// 4. Copy the config object below
const firebaseConfig = {
  apiKey: "AIzaSy...", // PASTE YOUR KEY HERE
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456...",
  appId: "1:123456..."
};

// Initialize Firebase
// We use a try-catch to prevent the app from crashing if config is dummy
let app;
let db: any = null; // Forced to null to avoid usage

try {
    /* 
    if (firebaseConfig.apiKey !== "AIzaSy...") {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        console.log("🔥 Firebase Initialized Successfully");
    } else {
        console.warn("⚠️ Firebase Config is missing. App is running in Local Simulation Mode.");
    }
    */
    console.warn("⚠️ Firebase imports disabled to fix compilation errors. App is running in Local Simulation Mode.");
} catch (e) {
    console.error("Firebase Init Error:", e);
}

export { db };
export const IS_MOCK_MODE = true; // Forced to true
