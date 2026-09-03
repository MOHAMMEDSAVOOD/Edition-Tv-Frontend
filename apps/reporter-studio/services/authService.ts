import { apiClient } from "@/lib/api-client";

export interface LoginRequest {
  email: string;
  passwordHash: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  passwordHash: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: string;
  email: string;
  roles: string[];
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/login", credentials);
    if (res.accessToken) {
      apiClient.setAccessToken(res.accessToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("edition_access_token", res.accessToken);
      }
    }
    return res;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/register", data);
    if (res.accessToken) {
      apiClient.setAccessToken(res.accessToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("edition_access_token", res.accessToken);
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
