import { apiClient } from "./api-client";

export interface LoginRequest {
  username?: string;
  email?: string;
  password?: string;
  passwordHash?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password?: string;
  passwordHash?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  userId?: string;
  email?: string;
  roles?: string[];
}

const FIREBASE_API_KEY =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FIREBASE_API_KEY) ||
  "AIzaSyBvBe8SCWbfuV77i7hKTteMAzYcxgNkzDU";

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const rawUserOrEmail = credentials.email || credentials.username || "";
    const trimmed = rawUserOrEmail.trim();
    const email = trimmed.includes("@") ? trimmed : `${trimmed}@editiontv.com`;
    const password = credentials.password || credentials.passwordHash || "";

    // 1. Primary Authentication: Firebase Identity Toolkit (Production Standard)
    try {
      apiClient.setAccessToken(null);
      const fbResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            returnSecureToken: true,
            email,
            password,
            clientType: "CLIENT_TYPE_WEB",
          }),
        }
      );

      const fbData = await fbResponse.json();

      if (fbResponse.ok && fbData.idToken) {
        const idToken: string = fbData.idToken;
        apiClient.setAccessToken(idToken);

        // Fetch user profile & roles from backend /auth/me
        let roles = ["ROLE_ADMIN"];
        let resolvedUsername = trimmed;
        try {
          const userMe = await apiClient.get<{
            id?: string;
            username?: string;
            email?: string;
            roles?: string[];
          }>("/auth/me");
          if (userMe?.roles && userMe.roles.length > 0) {
            roles = userMe.roles;
          }
          if (userMe?.username) {
            resolvedUsername = userMe.username;
          }
        } catch {}

        if (typeof window !== "undefined") {
          localStorage.setItem("edition_access_token", idToken);
          localStorage.setItem("edition_username", resolvedUsername);
          localStorage.setItem(
            "edition_auth_session",
            JSON.stringify({
              username: resolvedUsername,
              email: fbData.email || email,
              token: idToken,
              roles,
            })
          );
          document.cookie = `edition_access_token=${idToken}; path=/; max-age=86400; SameSite=Lax`;
        }

        return {
          accessToken: idToken,
          refreshToken: fbData.refreshToken,
          expiresIn: Number(fbData.expiresIn) || 3600,
          userId: fbData.localId,
          email: fbData.email || email,
          roles,
        };
      } else {
        const fbErr = fbData.error?.message;
        if (fbErr === "INVALID_LOGIN_CREDENTIALS" || fbErr === "EMAIL_NOT_FOUND" || fbErr === "INVALID_PASSWORD") {
          throw new Error("Invalid email or password. Please verify your credentials.");
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("Invalid email")) {
        throw err;
      }
      // Fall through to legacy/mock fallback
    }

    // 2. Fallback: Direct backend /auth/login
    const payload = {
      usernameOrEmail: credentials.username || credentials.email,
      email: credentials.email || credentials.username,
      password: credentials.password || credentials.passwordHash,
    };
    const res = await apiClient.post<AuthResponse>("/auth/login", payload);
    if (res.accessToken) {
      apiClient.setAccessToken(res.accessToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("edition_access_token", res.accessToken);
        document.cookie = `edition_access_token=${res.accessToken}; path=/; max-age=86400; SameSite=Lax`;
      }
    }
    return res;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const payload = {
      fullName: data.fullName,
      email: data.email,
      username: data.email.split("@")[0],
      password: data.password || data.passwordHash,
    };
    const res = await apiClient.post<AuthResponse>("/auth/register", payload);
    if (res.accessToken) {
      apiClient.setAccessToken(res.accessToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("edition_access_token", res.accessToken);
        document.cookie = `edition_access_token=${res.accessToken}; path=/; max-age=86400; SameSite=Lax`;
      }
    }
    return res;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/refresh-token", { refreshToken });
    if (res.accessToken) {
      apiClient.setAccessToken(res.accessToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("edition_access_token", res.accessToken);
        document.cookie = `edition_access_token=${res.accessToken}; path=/; max-age=86400; SameSite=Lax`;
      }
    }
    return res;
  },

  initAccessToken() {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("edition_access_token");
      if (token) {
        apiClient.setAccessToken(token);
      }
    }
  },
};
