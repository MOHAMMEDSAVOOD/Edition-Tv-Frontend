"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import type { MeProfile, Role } from "./types";

export type RoleGateStatus = "loading" | "anonymous" | "denied" | "error" | "ok";

export interface RoleGateOptions {
  /** Roles that may enter; any match passes. */
  allowedRoles: Role[];
  /** Where anonymous users are sent (default "/login"). */
  loginPath?: string;
  /** Path(s) that bypass the gate (default: [loginPath]). */
  publicPaths?: string[];
}

export interface RoleGateResult {
  status: RoleGateStatus;
  /** True when the current pathname is public (e.g. the login page itself). */
  isPublicPath: boolean;
  profile: MeProfile | null;
  error: string | null;
  signOut: () => Promise<void>;
  retry: () => Promise<MeProfile | null>;
}

/**
 * Shared auth-guard logic for the studio apps: waits for Firebase, redirects
 * anonymous users to the login page and checks `/auth/me` roles.
 * Requires an <AuthProvider> above (for the cached profile).
 */
export function useRoleGate({ allowedRoles, loginPath = "/login", publicPaths }: RoleGateOptions): RoleGateResult {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, profile, profileLoading, profileError, refreshProfile, signOut } = useAuth();

  const publics = publicPaths ?? [loginPath];
  const isPublicPath = publics.includes(pathname ?? "");

  let status: RoleGateStatus;
  if (loading) {
    status = "loading";
  } else if (!user) {
    status = "anonymous";
  } else if (profile) {
    status = allowedRoles.some((r) => profile.roles.includes(r)) ? "ok" : "denied";
  } else if (profileLoading) {
    status = "loading";
  } else if (profileError) {
    status = "error";
  } else {
    status = "loading";
  }

  useEffect(() => {
    if (isPublicPath) return;
    if (status === "anonymous") {
      router.replace(loginPath);
    }
  }, [status, isPublicPath, loginPath, router]);

  return { status, isPublicPath, profile, error: profileError, signOut, retry: refreshProfile };
}
