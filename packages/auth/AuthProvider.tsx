"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "firebase/auth";
import { fetchMe, getPublicApiBaseUrl, onAuthStateChanged, signOut as fbSignOut } from "./client";
import { hasAnyRole, hasRole, type MeProfile, type Role } from "./types";

export interface AuthState {
  /** Firebase user, null when signed out. */
  user: User | null;
  /** True until Firebase has restored (or ruled out) the persisted session. */
  loading: boolean;
  /** Cached `/auth/me` profile for the signed-in user (null until loaded / when signed out). */
  profile: MeProfile | null;
  /** True while `/auth/me` is in flight for the current user. */
  profileLoading: boolean;
  /** Error message from the last `/auth/me` attempt, if any. */
  profileError: string | null;
  /** Roles from `/auth/me` (empty until loaded). */
  roles: Role[];
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  /** Re-fetch `/auth/me` and update the cache. */
  refreshProfile: () => Promise<MeProfile | null>;
  /** Sign out of Firebase and clear the cached profile. */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
  /** Base URL used for `/auth/me`; defaults to NEXT_PUBLIC_API_URL / NEXT_PUBLIC_API_BASE_URL. */
  apiBaseUrl?: string;
  /** Set to false to skip loading `/auth/me` automatically. Default true. */
  loadProfile?: boolean;
}

/**
 * Subscribes to Firebase auth state once for the whole app and caches the
 * `/auth/me` profile so guards, navbars and account menus share one result.
 */
export function AuthProvider({ children, apiBaseUrl, loadProfile = true }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<MeProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const currentUid = useRef<string | null>(null);
  const baseUrl = apiBaseUrl ?? getPublicApiBaseUrl();

  const loadMe = useCallback(
    async (forUid: string): Promise<MeProfile | null> => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const me = await fetchMe(baseUrl);
        if (currentUid.current === forUid) {
          setProfile(me);
        }
        return me;
      } catch (err) {
        if (currentUid.current === forUid) {
          setProfile(null);
          setProfileError(err instanceof Error ? err.message : "Failed to load profile.");
        }
        return null;
      } finally {
        if (currentUid.current === forUid) setProfileLoading(false);
      }
    },
    [baseUrl]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((next) => {
      currentUid.current = next?.uid ?? null;
      setUser(next);
      setLoading(false);
      if (!next) {
        setProfile(null);
        setProfileError(null);
        setProfileLoading(false);
        return;
      }
      if (loadProfile) {
        void loadMe(next.uid);
      }
    });
    return unsubscribe;
  }, [loadMe, loadProfile]);

  const refreshProfile = useCallback(async () => {
    const uid = currentUid.current;
    if (!uid) return null;
    return loadMe(uid);
  }, [loadMe]);

  const signOut = useCallback(async () => {
    await fbSignOut();
    currentUid.current = null;
    setUser(null);
    setProfile(null);
    setProfileError(null);
  }, []);

  const value = useMemo<AuthState>(() => {
    const roles = profile?.roles ?? [];
    return {
      user,
      loading,
      profile,
      profileLoading,
      profileError,
      roles,
      hasRole: (role) => hasRole(profile, role),
      hasAnyRole: (list) => hasAnyRole(profile, list),
      refreshProfile,
      signOut,
    };
  }, [user, loading, profile, profileLoading, profileError, refreshProfile, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Standalone subscription used when no <AuthProvider> is mounted above.
 * Returns only `{ user, loading }`-level information (no cached profile).
 */
function useStandaloneAuth(enabled: boolean): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    return onAuthStateChanged((next) => {
      setUser(next);
      setLoading(false);
    });
  }, [enabled]);

  return useMemo<AuthState>(
    () => ({
      user,
      loading,
      profile: null,
      profileLoading: false,
      profileError: null,
      roles: [],
      hasRole: () => false,
      hasAnyRole: () => false,
      refreshProfile: async () => null,
      signOut: async () => {
        await fbSignOut();
        setUser(null);
      },
    }),
    [user, loading]
  );
}

/**
 * `useAuth()` — returns `{ user, loading, profile, roles, ... }`.
 * Works with or without an <AuthProvider>; the provider adds the cached
 * `/auth/me` profile and role helpers.
 */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  // Hooks must be called unconditionally; the standalone subscription is only
  // activated when no provider is present.
  const standalone = useStandaloneAuth(ctx === null);
  return ctx ?? standalone;
}
