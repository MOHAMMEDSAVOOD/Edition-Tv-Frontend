import { apiClient } from "@/lib/api-client";

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  username?: string;
  role?: string;
}

export const authService = {
  async login(usernameOrEmail: string, password: string): Promise<LoginResponse> {
    try {
      const data = await apiClient.post<LoginResponse>("/auth/login", {
        usernameOrEmail,
        username: usernameOrEmail,
        email: usernameOrEmail,
        password,
      });
      if (data.accessToken) {
        if (typeof window !== "undefined") {
          localStorage.setItem("edition_access_token", data.accessToken);
          localStorage.setItem("edition_username", usernameOrEmail);
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
