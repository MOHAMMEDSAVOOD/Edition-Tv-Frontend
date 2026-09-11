import { apiClient, ApiError } from "@/lib/api-client";

export interface BackendAuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
}

export interface AuthResponseDto {
  token: string;
  refreshToken: string;
  username: string;
  roles: string[];
}

export interface AuthResponseDto {
  token: string;
  refreshToken: string;
  username: string;
  roles: string[];
}

export const authRepository = {
  async login(usernameOrEmail: string, password: string): Promise<AuthResponseDto> {
    try {
      const raw = await apiClient.post<BackendAuthResponse>("/auth/login", {
        usernameOrEmail,
        email: usernameOrEmail,
        password,
      });

      if (typeof window !== "undefined" && raw.accessToken) {
        localStorage.setItem("edition_access_token", raw.accessToken);
        document.cookie = `edition_access_token=${raw.accessToken}; path=/; max-age=86400; SameSite=Lax`;
      }

      return {
        token: raw.accessToken,
        refreshToken: raw.refreshToken || "",
        username: usernameOrEmail,
        roles: ["ROLE_READER"],
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.details?.detail || error.details?.title || error.message || "Invalid email or password");
      }
      throw error;
    }
  },

  async register(username: string, email: string, password: string): Promise<AuthResponseDto> {
    try {
      const raw = await apiClient.post<BackendAuthResponse>("/auth/register", {
        username,
        email,
        password,
      });

      if (typeof window !== "undefined" && raw.accessToken) {
        localStorage.setItem("edition_access_token", raw.accessToken);
        document.cookie = `edition_access_token=${raw.accessToken}; path=/; max-age=86400; SameSite=Lax`;
      }

      return {
        token: raw.accessToken,
        refreshToken: raw.refreshToken || "",
        username,
        roles: ["ROLE_READER"],
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.details?.detail || error.details?.title || error.message || "Registration failed");
      }
      throw error;
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const raw = await apiClient.post<BackendAuthResponse>("/auth/refresh", { refreshToken });
      return {
        token: raw.accessToken,
        refreshToken: raw.refreshToken,
        username: "user",
        roles: ["ROLE_READER"],
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.details?.detail || error.details?.title || error.message || "Session refresh failed");
      }
      throw error;
    }
  },
};
