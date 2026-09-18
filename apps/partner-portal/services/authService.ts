/**
 * Partner Portal auth — thin wrapper over the shared Firebase client.
 * `login` = Firebase sign-in → `/auth/me` → editorial-role check.
 */
import {
  STAFF_ROLES,
  authService as sharedAuth,
  ensureAppAccess,
  type LoginResult,
  type MeProfile,
} from "@edition/auth";

export const CMS_APP_NAME = "Partner Portal";
export const CMS_REQUIRED_ROLES = STAFF_ROLES;

export type { LoginResult, MeProfile };

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBvBe8SCWbfuV77i7hKTteMAzYcxgNkzDU";

export const authService = {
  async login(email: string, password: string): Promise<LoginResult> {
    const result = await sharedAuth.login(email, password);
    await ensureAppAccess(result.profile, CMS_REQUIRED_ROLES, CMS_APP_NAME);
    return result;
  },

  async loginWithGoogle(): Promise<LoginResult> {
    const result = await sharedAuth.loginWithGoogle();
    await ensureAppAccess(result.profile, CMS_REQUIRED_ROLES, CMS_APP_NAME);
    return result;
  },

  me(): Promise<MeProfile | null> {
    return sharedAuth.me();
  },

  isAuthenticated(): boolean {
    return sharedAuth.isAuthenticated();
  },

  /** Sign out of Firebase and return to the login page. */
  logout(): Promise<void> {
    return sharedAuth.logout("/login");
  },
};
