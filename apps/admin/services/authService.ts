const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.editiontv.com/api/v1";

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
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail, password }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || errData.message || "Invalid credentials. Please check your username and password.");
    }

    const data: LoginResponse = await res.json();
    if (data.accessToken) {
      if (typeof window !== "undefined") {
        localStorage.setItem("edition_access_token", data.accessToken);
        localStorage.setItem("edition_username", usernameOrEmail);
        document.cookie = `edition_access_token=${data.accessToken}; path=/; max-age=86400; SameSite=Lax`;
      }
    }
    return data;
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
