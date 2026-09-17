/**
 * Auth repository — thin wrapper over the shared Firebase client.
 * Roles come from `/auth/me`, never from a hardcoded default.
 */
import { authService as sharedAuth, type LoginResult, type MeProfile, type Role } from "@edition/auth";

export interface AuthResponseDto {
  /** Firebase uid */
  uid: string;
  username: string;
  email: string;
  roles: Role[];
  profile: MeProfile;
}

function toDto(result: LoginResult): AuthResponseDto {
  return {
    uid: result.user.uid,
    username: result.profile.username || result.user.email || "",
    email: result.profile.email || result.user.email || "",
    roles: result.roles,
    profile: result.profile,
  };
}

export const authRepository = {
  /** Email/password sign-in via Firebase, then `/auth/me`. */
  async login(email: string, password: string): Promise<AuthResponseDto> {
    return toDto(await sharedAuth.login(email, password));
  },

  /** Google popup sign-in via Firebase, then `/auth/me`. */
  async loginWithGoogle(): Promise<AuthResponseDto> {
    return toDto(await sharedAuth.loginWithGoogle());
  },

  /** Create a Firebase account (displayName = fullName); `/auth/me` provisions it server-side (ROLE_READER). */
  async register(fullName: string, email: string, password: string): Promise<AuthResponseDto> {
    return toDto(await sharedAuth.register({ email, password, fullName }));
  },
};
