/**
 * Lazy, browser-only Firebase Web SDK initialisation.
 *
 * Nothing here runs at import time: the app / auth instances are created on
 * first use and only in the browser. Server Components and route handlers
 * must never call `getFirebaseAuth()`; it throws so mistakes surface early.
 */
import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getFirebaseConfig(): FirebaseOptions {
  const config: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  if (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) {
    config.messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  }
  return config;
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!isBrowser()) {
    throw new Error("@edition/auth: Firebase can only be initialised in the browser.");
  }
  if (app) return app;
  if (getApps().length > 0) {
    app = getApp();
    return app;
  }
  const config = getFirebaseConfig();
  if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
    console.warn(
      "@edition/auth: missing Firebase configuration. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY, " +
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID and NEXT_PUBLIC_FIREBASE_APP_ID are set."
    );
  }
  app = initializeApp(config);
  return app;
}

/**
 * Returns the Firebase Auth instance (created on first call). Firebase keeps
 * the session itself (IndexedDB persistence) — no tokens are stored by us.
 */
export function getFirebaseAuth(): Auth {
  if (auth) return auth;
  auth = getAuth(getFirebaseApp());
  return auth;
}
