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

interface JwtPayload {
  sub?: string;
  roles?: string[] | string;
  exp?: number;
}

function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const jsonStr = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(jsonStr) as JwtPayload;
  } catch {
    return null;
  }
}

function parseJwtRoles(token: string): string[] {
  const payload = parseJwtPayload(token);
  if (!payload) return ["ROLE_READER"];
  if (Array.isArray(payload.roles)) return payload.roles;
  if (typeof payload.roles === "string") return [payload.roles];
  return ["ROLE_READER"];
}

function parseJwtUsername(token: string, fallback: string): string {
  const payload = parseJwtPayload(token);
  return payload?.sub || fallback;
}

function mapAuthErrorMessage(error: unknown, defaultMsg: string): string {
  if (error instanceof ApiError) {
    const detail = error.details?.detail || error.details?.title;
    if (detail) {
      if (detail.toLowerCase().includes("bad credentials")) {
        return "Invalid email/username or password. Please try again.";
      }
      return detail;
    }
    return error.message || defaultMsg;
  }
  if (error instanceof Error) return error.message;
  return defaultMsg;
}

export const authRepository = {
  async login(usernameOrEmail: string, password: string): Promise<AuthResponseDto> {
    const trimmedInput = usernameOrEmail.trim();
    const candidates: string[] = [trimmedInput];

    if (trimmedInput.includes("@")) {
      const usernamePart = trimmedInput.split("@")[0].trim();
      if (usernamePart && !candidates.includes(usernamePart)) {
        candidates.push(usernamePart);
      }
      const editionTvEmail = `${usernamePart}@editiontv.com`;
      if (!candidates.includes(editionTvEmail)) {
        candidates.push(editionTvEmail);
      }
    }

    let lastError: unknown;

    for (const candidate of candidates) {
      try {
        const raw = await apiClient.post<BackendAuthResponse>("/auth/login", {
          usernameOrEmail: candidate,
          password,
        });

        if (typeof window !== "undefined" && raw.accessToken) {
          localStorage.setItem("edition_access_token", raw.accessToken);
          document.cookie = `edition_access_token=${raw.accessToken}; path=/; max-age=86400; SameSite=Lax; Secure`;
        }

        const userRoles = raw.roles || parseJwtRoles(raw.accessToken);
        const username = raw.username || parseJwtUsername(raw.accessToken, candidate);

        return {
          token: raw.accessToken,
          refreshToken: raw.refreshToken || "",
          username,
          roles: userRoles,
        };
      } catch (error) {
        lastError = error;
        // If error is not 401 Unauthorized (e.g. 500, network error), rethrow immediately
        if (error instanceof ApiError && error.status !== 401) {
          throw new Error(mapAuthErrorMessage(error, "Login failed"));
        }
      }
    }

    throw new Error(mapAuthErrorMessage(lastError, "Invalid email/username or password. Please try again."));
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
      const resolvedUsername = raw.username || parseJwtUsername(raw.accessToken, username);

      return {
        token: raw.accessToken,
        refreshToken: raw.refreshToken || "",
        username: resolvedUsername,
        roles: userRoles,
      };
    } catch (error) {
      throw new Error(mapAuthErrorMessage(error, "Registration failed"));
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
