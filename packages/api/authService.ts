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
    const payload = {
      usernameOrEmail: credentials.email,
      password: credentials.passwordHash
    };
    const res = await apiClient.post<AuthResponse>("/auth/login", payload);
    if (res.accessToken) {
      apiClient.setAccessToken(res.accessToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("edition_access_token", res.accessToken);
      }
    }
    return res;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const payload = {
      fullName: data.fullName,
      email: data.email,
      username: data.email.split("@")[0],
      password: data.passwordHash
    };
    const res = await apiClient.post<AuthResponse>("/auth/register", payload);
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
