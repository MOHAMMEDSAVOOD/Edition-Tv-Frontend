import { authRepository, AuthResponseDto } from "@/repositories/authRepository";
import { apiClient } from "@/lib/api-client";

export interface UserSession {
  username: string;
  token: string;
  roles: string[];
}

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

export const authService = {
  async login(payload: LoginRequest | string, passwordParam?: string): Promise<UserSession> {
    let usernameStr = "";
    let passStr = "";

    if (typeof payload === "string") {
      usernameStr = payload;
      passStr = passwordParam || "";
    } else {
      usernameStr = payload.username || payload.email || "";
      passStr = payload.password || payload.passwordHash || "";
    }

    const res: AuthResponseDto = await authRepository.login(usernameStr, passStr);
    if (res && res.token) {
      apiClient.setAccessToken(res.token);
      const session: UserSession = {
        username: res.username,
        token: res.token,
        roles: res.roles,
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("edition_auth_session", JSON.stringify(session));
      }
      return session;
    }

    throw new Error("Invalid credentials");
  },

  async register(req: RegisterRequest): Promise<UserSession> {
    const username = req.username || req.email.split("@")[0] || "";
    const passStr = req.password || req.passwordHash || "";
    const res: AuthResponseDto = await authRepository.register(username, req.email, passStr);
    if (res && res.token) {
      apiClient.setAccessToken(res.token);
      const session: UserSession = {
        username: res.username,
        token: res.token,
        roles: res.roles,
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("edition_auth_session", JSON.stringify(session));
      }
      return session;
    }

    throw new Error("Registration failed");
  },

  getCurrentSession(): UserSession | null {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("edition_auth_session");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          apiClient.setAccessToken(parsed.token);
          return parsed;
        } catch {
          // Parse error
        }
      }
    }
    return null;
  },

  logout(): void {
    apiClient.setAccessToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("edition_auth_session");
    }
  },
};
