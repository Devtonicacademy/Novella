import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCphANUBatGvouULBpuOlht5AykpirsMlU",
  authDomain: "novella-389a1.firebaseapp.com",
  projectId: "novella-389a1",
  storageBucket: "novella-389a1.firebasestorage.app",
  messagingSenderId: "630516781798",
  appId: "1:630516781798:web:9524d26b62608b7e4ce127",
  measurementId: "G-3DDKMV037E"
};

// Initialize Firebase safely
export const firebaseApp: FirebaseApp = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApp();

// Firebase Auth & Firestore instances
export const auth: Auth = getAuth(firebaseApp);
export const db: Firestore = getFirestore(firebaseApp);

// Analytics initialized conditionally if supported in the browser
let analyticsInstance: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analyticsInstance = getAnalytics(firebaseApp);
    }
  }).catch(() => {
    // Analytics not supported in this environment
  });
}

export const analytics = analyticsInstance;
