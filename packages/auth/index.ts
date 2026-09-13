/**
 * @edition/auth — Firebase Authentication for every Edition TV app.
 *
 * Browser-only, lazily initialised. Sessions are persisted by Firebase
 * (IndexedDB); no tokens are written to localStorage or cookies.
 */
export { getFirebaseApp, getFirebaseAuth, getFirebaseConfig, isBrowser } from "./firebase";
export {
  describeAuthError,
  fetchMe,
  getCurrentUser,
  getIdToken,
  getPublicApiBaseUrl,
  onAuthStateChanged,
  registerWithEmail,
  sendPasswordReset,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  waitForAuthReady,
} from "./client";
export type { User } from "./client";
export { AuthProvider, useAuth } from "./AuthProvider";
export type { AuthProviderProps, AuthState } from "./AuthProvider";
export { AuthMeError, STAFF_ROLES, displayNameOf, hasAnyRole, hasRole } from "./types";
export type { MeProfile, Role } from "./types";
export { authService, ensureAppAccess } from "./authService";
export type { LoginResult } from "./authService";
export { useRoleGate } from "./useRoleGate";
export type { RoleGateOptions, RoleGateResult, RoleGateStatus } from "./useRoleGate";
export { GoogleIcon } from "./GoogleIcon";
