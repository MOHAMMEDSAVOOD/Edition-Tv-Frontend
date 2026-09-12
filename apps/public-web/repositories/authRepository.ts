import { apiClient, ApiError } from "@/lib/api-client";

export interface BackendAuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  username?: string;
  roles?: string[];
}

export interface AuthResponseDto {
  token: string;
  refreshToken: string;
  username: string;
  roles: string[];
}

function parseJwtRoles(token: string): string[] {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return ["ROLE_READER"];
    const decoded = JSON.parse(atob(payloadBase64));
    if (Array.isArray(decoded.roles)) return decoded.roles;
    if (typeof decoded.role === "string") return [decoded.role];
    return ["ROLE_READER"];
  } catch {
    return ["ROLE_READER"];
  }
}

export const authRepository = {
  async login(usernameOrEmail: string, password: string): Promise<AuthResponseDto> {
    try {
      const raw = await apiClient.post<BackendAuthResponse>("/auth/login", {
        usernameOrEmail,
        password,
      });

      if (typeof window !== "undefined" && raw.accessToken) {
        localStorage.setItem("edition_access_token", raw.accessToken);
        document.cookie = `edition_access_token=${raw.accessToken}; path=/; max-age=86400; SameSite=Lax; Secure`;
      }

      const userRoles = raw.roles || parseJwtRoles(raw.accessToken);

      return {
        token: raw.accessToken,
        refreshToken: raw.refreshToken || "",
        username: raw.username || usernameOrEmail,
        roles: userRoles,
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
        document.cookie = `edition_access_token=${raw.accessToken}; path=/; max-age=86400; SameSite=Lax; Secure`;
      }

      const userRoles = raw.roles || parseJwtRoles(raw.accessToken);

      return {
        token: raw.accessToken,
        refreshToken: raw.refreshToken || "",
        username: raw.username || username,
        roles: userRoles,
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
      const userRoles = raw.roles || parseJwtRoles(raw.accessToken);
      return {
        token: raw.accessToken,
        refreshToken: raw.refreshToken,
        username: raw.username || "user",
        roles: userRoles,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.details?.detail || error.details?.title || error.message || "Session refresh failed");
      }
      throw error;
    }
  },
};
