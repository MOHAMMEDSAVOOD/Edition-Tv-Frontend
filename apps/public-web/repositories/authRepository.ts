import { apiClient } from "@/lib/api-client";

export interface BackendAuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthResponseDto {
  token: string;
  refreshToken: string;
  username: string;
  roles: string[];
}

export const authRepository = {
  async login(username: string, password: string): Promise<AuthResponseDto> {
    const raw = await apiClient.post<BackendAuthResponse>("/auth/login", {
      usernameOrEmail: username,
      password,
    });
    return {
      token: raw.accessToken,
      refreshToken: raw.refreshToken,
      username,
      roles: ["ROLE_READER"],
    };
  },

  async register(username: string, email: string, password: string): Promise<AuthResponseDto> {
    const raw = await apiClient.post<BackendAuthResponse>("/auth/register", {
      username,
      email,
      password,
    });
    return {
      token: raw.accessToken,
      refreshToken: raw.refreshToken,
      username,
      roles: ["ROLE_READER"],
    };
  },

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    const raw = await apiClient.post<BackendAuthResponse>("/auth/refresh", { refreshToken });
    return {
      token: raw.accessToken,
      refreshToken: raw.refreshToken,
      username: "user",
      roles: ["ROLE_READER"],
    };
  },
};
