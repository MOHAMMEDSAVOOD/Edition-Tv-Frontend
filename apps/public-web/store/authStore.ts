import { create } from "zustand";

export interface UserSession {
  username: string;
  token: string;
  roles: string[];
  email?: string;
  userId?: string;
}

interface AuthState {
  session: UserSession | null;
  accessToken: string | null;
  setSession: (session: UserSession, token: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  accessToken: null,
  setSession: (session, token) => set({ session, accessToken: token }),
  clearSession: () => set({ session: null, accessToken: null }),
}));
