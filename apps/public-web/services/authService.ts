import { authRepository, AuthResponseDto } from "@/repositories/authRepository";
import { apiClient } from "@/lib/api-client";
import { useAuthStore, UserSession } from "@/store/authStore";

export type { UserSession };

export interface RegisterRequest {
  username?: string;
  fullName?: string;
  email: string;
  password?: string;
  passwordHash?: string;
}

export interface LoginRequest {
  email?: string;
  username?: string;
  password?: string;
  passwordHash?: string;
}

function notifyAuthChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("edition_auth_changed"));
  }
}

function sanitizeUsername(input?: string, fallbackEmail = ""): string {
  let user = (input || "").trim().toLowerCase().replace(/[^a-zA-Z0-9_-]/g, "");
  if (!user && fallbackEmail) {
    user = fallbackEmail.split("@")[0].toLowerCase().replace(/[^a-zA-Z0-9_-]/g, "");
  }
  if (user.length < 3) {
    user = (user + "usr").slice(0, 3);
  }
  if (user.length > 50) {
    user = user.slice(0, 50);
  }
  return user;
}

export const authService = {
  async login(payload: LoginRequest | string, passwordParam?: string): Promise<UserSession> {
    let usernameStr = "";
    let passStr = "";

    if (typeof payload === "string") {
      usernameStr = payload.trim();
      passStr = passwordParam || "";
    } else {
      usernameStr = (payload.username || payload.email || "").trim();
      passStr = payload.password || payload.passwordHash || "";
    }

    const res: AuthResponseDto = await authRepository.login(usernameStr, passStr);
    if (res && res.token) {
      apiClient.setAccessToken(res.token);
      const session: UserSession = {
        username: res.username,
        token: res.token,
        roles: res.roles,
        email: res.email,
        userId: res.userId,
      };
      if (typeof window !== "undefined") {
        useAuthStore.getState().setSession(session, res.token);
      }
      notifyAuthChange();
      return session;
    }

    throw new Error("Invalid credentials");
  },

  async register(req: RegisterRequest): Promise<UserSession> {
    const username = sanitizeUsername(req.username || req.fullName, req.email);
    const passStr = req.password || req.passwordHash || "";
    const res: AuthResponseDto = await authRepository.register(username, req.email.trim(), passStr);
    if (res && res.token) {
      apiClient.setAccessToken(res.token);
      const session: UserSession = {
        username: res.username,
        token: res.token,
        roles: res.roles,
        email: res.email,
        userId: res.userId,
      };
      if (typeof window !== "undefined") {
        useAuthStore.getState().setSession(session, res.token);
      }
      notifyAuthChange();
      return session;
    }

    throw new Error("Registration failed");
  },

  getCurrentSession(): UserSession | null {
    if (typeof window !== "undefined") {
      const session = useAuthStore.getState().session;
      if (session && session.token) {
        apiClient.setAccessToken(session.token);
      }
      return session;
    }
    return null;
  },

  logout(): void {
    apiClient.setAccessToken(null);
    if (typeof window !== "undefined") {
      useAuthStore.getState().clearSession();
      document.cookie = "edition_access_token=; path=/; max-age=0; SameSite=Lax";
      notifyAuthChange();
    }
  },
};
