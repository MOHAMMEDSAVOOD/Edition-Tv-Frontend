/**
 * Thin, promise-based facade over the Firebase client for code that used the
 * old `authService.login()/register()/logout()` shape.
 *
 * `login` = signInWithEmail → fetchMe. Roles come from `/auth/me`, never from
 * a hardcoded default.
 */
import {
  describeAuthError,
  fetchMe,
  getCurrentUser,
  getIdToken,
  registerWithEmail,
  sendPasswordReset,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  type User,
} from "./client";
import type { MeProfile, Role } from "./types";

export interface LoginResult {
  user: User;
  profile: MeProfile;
  roles: Role[];
}

interface LoginPayload {
  email?: string;
  username?: string;
  password?: string;
  passwordHash?: string;
}

interface RegisterPayload {
  email: string;
  password?: string;
  passwordHash?: string;
  fullName?: string;
  username?: string;
}

async function finish(user: User, apiBaseUrl?: string): Promise<LoginResult> {
  const profile = await fetchMe(apiBaseUrl);
  return { user, profile, roles: profile.roles };
}

/**
 * Studio apps call this right after sign-in: if the `/auth/me` roles do not
 * include one of `allowedRoles`, the Firebase session is ended and an error
 * "This account has no access to <appName>" is thrown.
 */
export async function ensureAppAccess(profile: MeProfile, allowedRoles: Role[], appName: string): Promise<void> {
  const ok = allowedRoles.some((r) => profile.roles.includes(r));
  if (!ok) {
    await signOut();
    throw new Error(`This account has no access to ${appName}`);
  }
}

export const authService = {
  /**
   * Sign in with email + password, then load `/auth/me`.
   * Accepts either `(email, password)` or `{ email | username, password | passwordHash }`.
   */
  async login(payload: LoginPayload | string, password?: string, apiBaseUrl?: string): Promise<LoginResult> {
    const email = typeof payload === "string" ? payload : payload.email || payload.username || "";
    const pass = typeof payload === "string" ? password || "" : payload.password || payload.passwordHash || "";
    try {
      const cred = await signInWithEmail(email, pass);
      return await finish(cred.user, apiBaseUrl);
    } catch (err) {
      throw new Error(describeAuthError(err));
    }
  },

  /** Google popup sign-in, then `/auth/me`. */
  async loginWithGoogle(apiBaseUrl?: string): Promise<LoginResult> {
    try {
      const cred = await signInWithGoogle();
      return await finish(cred.user, apiBaseUrl);
    } catch (err) {
      throw new Error(describeAuthError(err));
    }
  },

  /** Create a Firebase account (displayName = fullName), then `/auth/me` provisions it server-side. */
  async register(data: RegisterPayload, apiBaseUrl?: string): Promise<LoginResult> {
    const pass = data.password || data.passwordHash || "";
    try {
      const cred = await registerWithEmail(data.email, pass, data.fullName || data.username);
      return await finish(cred.user, apiBaseUrl);
    } catch (err) {
      throw new Error(describeAuthError(err, "Registration failed."));
    }
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      await sendPasswordReset(email);
    } catch (err) {
      throw new Error(describeAuthError(err, "Unable to send the password reset email."));
    }
  },

  /** Current `/auth/me` profile for the signed-in user (null when signed out). */
  async me(apiBaseUrl?: string): Promise<MeProfile | null> {
    if (!getCurrentUser()) return null;
    return fetchMe(apiBaseUrl);
  },

  getToken(forceRefresh = false): Promise<string | null> {
    return getIdToken(forceRefresh);
  },

  isAuthenticated(): boolean {
    return getCurrentUser() !== null;
  },

  /** Sign out of Firebase; optionally navigate afterwards (e.g. "/login"). */
  async logout(redirectTo?: string): Promise<void> {
    await signOut();
    if (redirectTo && typeof window !== "undefined") {
      window.location.href = redirectTo;
    }
  },
};
