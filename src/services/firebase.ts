import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

// Your web app's Firebase configuration for Novella App
export const firebaseConfig = {
  apiKey: "AIzaSyCipKGnd02PIcHaxAFd0V4_sRRuW9qSRp4",
  authDomain: "novella-app-2026.firebaseapp.com",
  projectId: "novella-app-2026",
  storageBucket: "novella-app-2026.firebasestorage.app",
  messagingSenderId: "652056059178",
  appId: "1:652056059178:web:e42f8e7e0050594fe41253"
};

// Initialize Firebase safely
export const firebaseApp: FirebaseApp = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApp();

// Firebase Auth & Firestore instances
export const auth: Auth = getAuth(firebaseApp);
export const db: Firestore = getFirestore(firebaseApp);

export const googleAuthProvider = new GoogleAuthProvider();

// Firebase Auth Helper Methods
export async function firebaseSignIn(email: string, password: string): Promise<UserCredential> {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function firebaseSignUp(email: string, password: string): Promise<UserCredential> {
  return await createUserWithEmailAndPassword(auth, email, password);
}

export async function firebaseGoogleSignIn(): Promise<UserCredential> {
  return await signInWithPopup(auth, googleAuthProvider);
}

export async function firebaseSignOutUser(): Promise<void> {
  return await fbSignOut(auth);
}

export async function firebaseSendPasswordReset(email: string): Promise<void> {
  return await sendPasswordResetEmail(auth, email);
}

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
