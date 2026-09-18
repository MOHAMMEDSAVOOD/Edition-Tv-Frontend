/**
 * Firebase Authentication client shared by every Edition TV app.
 *
 * All functions are safe to import anywhere but must be *called* in the
 * browser. The Firebase session is persisted by the SDK (IndexedDB); we never
 * write tokens to localStorage or cookies.
 */
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged as fbOnAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  type User,
  type UserCredential,
} from "firebase/auth";
import { getFirebaseAuth, isBrowser } from "./firebase";
import { AuthMeError, type MeProfile } from "./types";

export type { User } from "firebase/auth";

const DEFAULT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api1.editiontv.com/api/v1";

/** Public API base URL as seen from the browser (…/api/v1). */
export function getPublicApiBaseUrl(): string {
  return DEFAULT_API_BASE_URL.replace(/\/+$/, "");
}

/** Human-readable messages for the most common Firebase error codes. */
export function describeAuthError(err: unknown, fallback = "Authentication failed."): string {
  const code = (err as { code?: string } | null)?.code ?? "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-login-credentials":
      return "Invalid email or password.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Google sign-in was cancelled.";
    case "auth/popup-blocked":
      return "The sign-in popup was blocked by the browser. Please allow popups and retry.";
    case "auth/network-request-failed":
      return "Network error while contacting the authentication service.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled for the project.";
    default:
      if (err instanceof Error && err.message) return err.message;
      return fallback;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
}

export async function signInWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(getFirebaseAuth(), provider);
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> {
  const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
  const name = displayName?.trim();
  if (name) {
    await updateProfile(cred.user, { displayName: name });
  }
  return cred;
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
}

export async function signOut(): Promise<void> {
  if (!isBrowser()) return;
  await fbSignOut(getFirebaseAuth());
}

/** The currently signed-in Firebase user, or null (also null on the server). */
export function getCurrentUser(): User | null {
  if (!isBrowser()) return null;
  try {
    return getFirebaseAuth().currentUser;
  } catch {
    return null;
  }
}

/**
 * Waits for Firebase to restore the persisted session (first load) and then
 * resolves with the current user. Avoids the "currentUser is null for the first
 * few ms after reload" race when a request fires before auth is ready.
 */
let readyPromise: Promise<User | null> | null = null;
export function waitForAuthReady(): Promise<User | null> {
  if (!isBrowser()) return Promise.resolve(null);
  if (readyPromise) return readyPromise;
  readyPromise = new Promise<User | null>((resolve) => {
    try {
      const auth = getFirebaseAuth();
      const unsubscribe = fbOnAuthStateChanged(
        auth,
        (user) => {
          unsubscribe();
          resolve(user);
        },
        () => {
          unsubscribe();
          resolve(null);
        }
      );
    } catch {
      resolve(null);
    }
  });
  return readyPromise;
}

/**
 * Current user's Firebase ID token, or null when nobody is signed in.
 * Pass `forceRefresh` to mint a new token (used after a 401 from the API).
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  if (!isBrowser()) return null;
  const user = getCurrentUser() ?? (await waitForAuthReady());
  if (!user) return null;
  try {
    return await user.getIdToken(forceRefresh);
  } catch {
    return null;
  }
}

/** Subscribe to auth state. Returns an unsubscribe function (no-op on the server). */
export function onAuthStateChanged(cb: (user: User | null) => void): () => void {
  if (!isBrowser()) return () => {};
  try {
    return fbOnAuthStateChanged(getFirebaseAuth(), cb);
  } catch (err) {
    console.error("[@edition/auth] onAuthStateChanged failed:", err);
    cb(null);
    return () => {};
  }
}

/**
 * GET {apiBaseUrl}/auth/me with the bearer token. Calling it after first
 * sign-in provisions the user server-side (brand-new users get ROLE_READER).
 */
export async function fetchMe(apiBaseUrl: string = getPublicApiBaseUrl()): Promise<MeProfile> {
  const token = await getIdToken();
  if (!token) {
    throw new AuthMeError(401, "Not signed in.");
  }
  const base = apiBaseUrl.replace(/\/+$/, "");
  const doFetch = (bearer: string) =>
    fetch(`${base}/auth/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${bearer}`, Accept: "application/json" },
      cache: "no-store",
    });

  let res = await doFetch(token);
  if (res.status === 401) {
    const fresh = await getIdToken(true);
    if (fresh && fresh !== token) {
      res = await doFetch(fresh);
    }
  }
  if (!res.ok) {
    let detail = `Failed to load profile (HTTP ${res.status}).`;
    try {
      const body = (await res.json()) as { detail?: string; title?: string; message?: string };
      detail = body.detail || body.message || body.title || detail;
    } catch {
      // ignore non-JSON bodies
    }
    throw new AuthMeError(res.status, detail);
  }
  const data = (await res.json()) as Partial<MeProfile>;
  return {
    id: String(data.id ?? ""),
    username: data.username ?? "",
    email: data.email ?? "",
    firstName: data.firstName ?? "",
    lastName: data.lastName ?? "",
    roles: Array.isArray(data.roles) ? data.roles : [],
  };
}
