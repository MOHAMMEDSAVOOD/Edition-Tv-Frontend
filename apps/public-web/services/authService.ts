/**
 * Public web auth service — thin facade over `@edition/auth` (Firebase).
 * No tokens are stored by us; Firebase persists the session itself.
 */
import {
  authService as sharedAuth,
  fetchMe,
  getCurrentUser,
  type MeProfile,
  type Role,
  type User,
} from "@edition/auth";
import { authRepository, type AuthResponseDto } from "@/repositories/authRepository";

export interface UserSession {
  uid: string;
  username: string;
  email: string;
  roles: Role[];
  profile: MeProfile;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

function toSession(dto: AuthResponseDto): UserSession {
  return { uid: dto.uid, username: dto.username, email: dto.email, roles: dto.roles, profile: dto.profile };
}

export const authService = {
  async login(req: LoginRequest): Promise<UserSession> {
    return toSession(await authRepository.login(req.email, req.password));
  },

  async loginWithGoogle(): Promise<UserSession> {
    return toSession(await authRepository.loginWithGoogle());
  },

  async register(req: RegisterRequest): Promise<UserSession> {
    return toSession(await authRepository.register(req.fullName, req.email, req.password));
  },

  /** Send the Firebase password-reset email (the hosted page handles the reset link). */
  forgotPassword(email: string): Promise<void> {
    return sharedAuth.forgotPassword(email);
  },

  /** Firebase user currently signed in (null when signed out or on the server). */
  getCurrentUser(): User | null {
    return getCurrentUser();
  },

  /** `/auth/me` profile for the signed-in user, or null when signed out. */
  async getCurrentSession(): Promise<UserSession | null> {
    const user = getCurrentUser();
    if (!user) return null;
    const profile = await fetchMe();
    return {
      uid: user.uid,
      username: profile.username || user.email || "",
      email: profile.email || user.email || "",
      roles: profile.roles,
      profile,
    };
  },

  isAuthenticated(): boolean {
    return getCurrentUser() !== null;
  },

  logout(): Promise<void> {
    return sharedAuth.logout();
  },
};
