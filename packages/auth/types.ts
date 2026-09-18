/**
 * Shared auth types for the Edition TV monorepo.
 */

/** Roles as returned by the Spring backend's `/auth/me`. */
export type Role = "ROLE_ADMIN" | "ROLE_EDITOR" | "ROLE_REPORTER" | "ROLE_READER" | (string & {});

/** Profile returned by `GET {API}/auth/me` (also provisions the user on first call). */
export interface MeProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
}

/** Any of ROLE_ADMIN / ROLE_EDITOR / ROLE_REPORTER — the editorial staff set. */
export const STAFF_ROLES: Role[] = ["ROLE_ADMIN", "ROLE_EDITOR", "ROLE_REPORTER"];

export function hasRole(profile: Pick<MeProfile, "roles"> | null | undefined, role: Role): boolean {
  return !!profile?.roles?.includes(role);
}

export function hasAnyRole(profile: Pick<MeProfile, "roles"> | null | undefined, roles: Role[]): boolean {
  if (!profile?.roles) return false;
  return roles.some((r) => profile.roles.includes(r));
}

export function displayNameOf(profile: MeProfile | null | undefined, fallback = ""): string {
  if (!profile) return fallback;
  const full = `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim();
  return full || profile.username || profile.email || fallback;
}

export class AuthMeError extends Error {
  public readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "AuthMeError";
    this.status = status;
  }
}
