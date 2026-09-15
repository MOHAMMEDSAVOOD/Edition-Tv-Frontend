import { apiClient } from "@/lib/api-client";

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  username?: string;
  role?: string;
}

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBvBe8SCWbfuV77i7hKTteMAzYcxgNkzDU";

export const authService = {
  async login(usernameOrEmail: string, password: string): Promise<LoginResponse> {
    const trimmed = usernameOrEmail.trim();
    const email = trimmed.includes("@") ? trimmed : `${trimmed}@editiontv.com`;

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
        let role = "ROLE_ADMIN";
        let resolvedUsername = trimmed;
        try {
          const userMe = await apiClient.get<{
            id?: string;
            username?: string;
            email?: string;
            firstName?: string;
            lastName?: string;
            roles?: string[];
          }>("/auth/me");
          if (userMe?.roles && userMe.roles.length > 0) {
            role = userMe.roles[0];
          }
          if (userMe?.username) {
            resolvedUsername = userMe.username;
          }
        } catch {
          // If /auth/me has network error, fallback to default admin role
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("edition_access_token", idToken);
          localStorage.setItem("edition_username", resolvedUsername);
          localStorage.setItem(
            "edition_auth_session",
            JSON.stringify({
              username: resolvedUsername,
              email: fbData.email || email,
              token: idToken,
              roles: [role],
            })
          );
          document.cookie = `edition_access_token=${idToken}; path=/; max-age=86400; SameSite=Lax`;
        }

        return {
          accessToken: idToken,
          refreshToken: fbData.refreshToken,
          expiresIn: Number(fbData.expiresIn) || 3600,
          username: resolvedUsername,
          role,
        };
      } else {
        const fbErr = fbData.error?.message;
        if (fbErr === "INVALID_LOGIN_CREDENTIALS" || fbErr === "EMAIL_NOT_FOUND" || fbErr === "INVALID_PASSWORD") {
          throw new Error("Invalid admin email or password. Please verify your credentials.");
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("Invalid admin email")) {
        throw err;
      }
      // Fall through to the backend /auth/login path if Firebase is unreachable
    }

    // 2. Fallback: Direct backend /auth/login
    try {
      const data = await apiClient.post<LoginResponse>("/auth/login", {
        usernameOrEmail: trimmed,
        password,
      });
      if (data.accessToken) {
        if (typeof window !== "undefined") {
          localStorage.setItem("edition_access_token", data.accessToken);
          localStorage.setItem("edition_username", trimmed);
          localStorage.setItem(
            "edition_auth_session",
            JSON.stringify({ username: trimmed, token: data.accessToken, roles: data.role ? [data.role] : ["ROLE_ADMIN"] })
          );
          document.cookie = `edition_access_token=${data.accessToken}; path=/; max-age=86400; SameSite=Lax`;
          apiClient.setAccessToken(data.accessToken);
        }
      }
      return data;
    } catch (err: any) {
      if (err.status === 403 || err.status === 401) {
        throw new Error("Invalid admin username or password. Please verify your credentials.");
      }
      const errData = err.details || {};
      throw new Error(
        errData.detail || errData.message || errData.title || "Authentication failed. Please check your admin credentials."
      );
    }
  },


  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      const data = await apiClient.post<LoginResponse>("/auth/refresh-token", { refreshToken });
      if (data.accessToken && typeof window !== "undefined") {
        localStorage.setItem("edition_access_token", data.accessToken);
        document.cookie = `edition_access_token=${data.accessToken}; path=/; max-age=86400; SameSite=Lax`;
        apiClient.setAccessToken(data.accessToken);
      }
      return data;
    } catch (err: any) {
      const errData = err.details || {};
      throw new Error(errData.detail || errData.message || "Failed to refresh token.");
    }
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("edition_access_token");
  },

  getUsername(): string {
    if (typeof window === "undefined") return "Admin";
    return localStorage.getItem("edition_username") || "Admin";
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("edition_access_token");
      localStorage.removeItem("edition_username");
      localStorage.removeItem("edition_user_role");
      document.cookie = "edition_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = "/login";
    }
  },
};
