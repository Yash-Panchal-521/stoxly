import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

export const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);

let firebaseAppInstance: FirebaseApp | undefined;

if (hasFirebaseConfig) {
  if (getApps().length > 0) {
    firebaseAppInstance = getApp();
  } else {
    firebaseAppInstance = initializeApp(firebaseConfig);
  }
}

export const firebaseApp = firebaseAppInstance;

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : undefined;
