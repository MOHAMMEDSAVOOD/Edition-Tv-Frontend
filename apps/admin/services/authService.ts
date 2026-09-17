/**
 * Admin Console auth — thin wrapper over the shared Firebase client.
 * `login` = Firebase email/password sign-in → `/auth/me` → ROLE_ADMIN check.
 */
import { authService as sharedAuth, ensureAppAccess, type LoginResult, type MeProfile } from "@edition/auth";

export const ADMIN_APP_NAME = "Admin Console";
export const ADMIN_REQUIRED_ROLES = ["ROLE_ADMIN"];

export type { LoginResult, MeProfile };

export const authService = {
  async login(email: string, password: string): Promise<LoginResult> {
    const result = await sharedAuth.login(email, password);
    await ensureAppAccess(result.profile, ADMIN_REQUIRED_ROLES, ADMIN_APP_NAME);
    return result;
  },

  async loginWithGoogle(): Promise<LoginResult> {
    const result = await sharedAuth.loginWithGoogle();
    await ensureAppAccess(result.profile, ADMIN_REQUIRED_ROLES, ADMIN_APP_NAME);
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
