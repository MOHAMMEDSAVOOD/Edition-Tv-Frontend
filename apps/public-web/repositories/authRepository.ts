import { apiClient, ApiError } from "@/lib/api-client";

export interface BackendAuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  username?: string;
  email?: string;
  userId?: string;
  roles?: string[];
}

export interface AuthResponseDto {
  token: string;
  refreshToken: string;
  username: string;
  email?: string;
  userId?: string;
  roles: string[];
}

interface JwtPayload {
  sub?: string;
  email?: string;
  user_id?: string;
  roles?: string[] | string;
  exp?: number;
}

const FIREBASE_API_KEY =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FIREBASE_API_KEY) ||
  "AIzaSyBvBe8SCWbfuV77i7hKTteMAzYcxgNkzDU";

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
  return payload?.sub || payload?.email?.split("@")[0] || fallback;
}

function mapAuthErrorMessage(error: unknown, defaultMsg: string): string {
  if (error instanceof ApiError) {
    const detail = error.details?.detail || error.details?.title;
    if (detail) {
      if (detail.toLowerCase().includes("bad credentials") || detail.toLowerCase().includes("invalid")) {
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
  /**
   * Primary Login Flow:
   * 1. Firebase Identity Toolkit (accounts:signInWithPassword) - Production Standard
   * 2. Synchronize with Backend /auth/me or /users/me
   * 3. Fallback to Direct Backend /auth/login
   */
  async login(usernameOrEmail: string, password: string): Promise<AuthResponseDto> {
    const trimmedInput = usernameOrEmail.trim();
    const isEmail = trimmedInput.includes("@");
    const emailCandidate = isEmail ? trimmedInput : `${trimmedInput}@editiontv.com`;

    // ── 1. PRIMARY: Firebase Identity Toolkit ───────────────────
    try {
      apiClient.setAccessToken(null);

      const fbResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            returnSecureToken: true,
            email: emailCandidate,
            password,
            clientType: "CLIENT_TYPE_WEB",
          }),
        }
      );

      const fbData = await fbResponse.json();

      if (fbResponse.ok && fbData.idToken) {
        const idToken: string = fbData.idToken;
        apiClient.setAccessToken(idToken);

        // Synchronize with backend /auth/me or /users/me
        let roles = ["ROLE_READER"];
        let resolvedUsername = isEmail ? trimmedInput.split("@")[0] : trimmedInput;
        let resolvedEmail = fbData.email || emailCandidate;
        let resolvedUserId = fbData.localId;

        try {
          const userMe = await apiClient.get<{
            id?: string;
            userId?: string;
            username?: string;
            email?: string;
            roles?: string[];
            role?: string;
          }>("/auth/me");

          if (userMe?.roles && userMe.roles.length > 0) {
            roles = userMe.roles;
          } else if (userMe?.role) {
            roles = [userMe.role];
          }
          if (userMe?.username) {
            resolvedUsername = userMe.username;
          }
          if (userMe?.email) {
            resolvedEmail = userMe.email;
          }
          if (userMe?.id || userMe?.userId) {
            resolvedUserId = userMe.id || userMe.userId;
          }
        } catch {
          // If /auth/me fails, try /users/me
          try {
            const usersMe = await apiClient.get<{
              id?: string;
              username?: string;
              email?: string;
              role?: string;
              roles?: string[];
            }>("/users/me");

            if (usersMe?.username) resolvedUsername = usersMe.username;
            if (usersMe?.roles && usersMe.roles.length > 0) roles = usersMe.roles;
            else if (usersMe?.role) roles = [usersMe.role];
          } catch {
            // Fall back to JWT roles
            roles = parseJwtRoles(idToken);
          }
        }

        // Store session tokens
        if (typeof window !== "undefined") {
          
          
          
          document.cookie = `edition_access_token=${idToken}; path=/; max-age=86400; SameSite=Lax`;
        }

        return {
          token: idToken,
          refreshToken: fbData.refreshToken || "",
          username: resolvedUsername,
          email: resolvedEmail,
          userId: resolvedUserId,
          roles,
        };
      } else if (fbData.error?.message) {
        const msg = fbData.error.message;
        if (
          msg === "INVALID_LOGIN_CREDENTIALS" ||
          msg === "EMAIL_NOT_FOUND" ||
          msg === "INVALID_PASSWORD"
        ) {
          throw new Error("Invalid email/username or password. Please try again.");
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("Invalid email/username or password")) {
        throw err;
      }
      // If network failure or credentials not in Firebase, fall through to backend /auth/login
    }

    // ── 2. FALLBACK: Direct Backend /auth/login ───────────────────
    const candidates = [trimmedInput];
    if (isEmail) {
      const u = trimmedInput.split("@")[0].trim();
      if (u && !candidates.includes(u)) candidates.push(u);
    } else {
      if (!candidates.includes(emailCandidate)) candidates.push(emailCandidate);
    }

    let lastError: unknown;

    for (const candidate of candidates) {
      try {
        apiClient.setAccessToken(null);
        const raw = await apiClient.post<BackendAuthResponse>("/auth/login", {
          usernameOrEmail: candidate,
          email: candidate,
          password,
        });

        if (raw && raw.accessToken) {
          const userRoles = raw.roles || parseJwtRoles(raw.accessToken);
          const username = raw.username || parseJwtUsername(raw.accessToken, candidate);

          if (typeof window !== "undefined") {
            
            
            
            document.cookie = `edition_access_token=${raw.accessToken}; path=/; max-age=86400; SameSite=Lax`;
            apiClient.setAccessToken(raw.accessToken);
          }

          return {
            token: raw.accessToken,
            refreshToken: raw.refreshToken || "",
            username,
            email: raw.email,
            userId: raw.userId,
            roles: userRoles,
          };
        }
      } catch (error) {
        lastError = error;
        if (error instanceof ApiError && error.status !== 401 && error.status !== 404) {
          throw new Error(mapAuthErrorMessage(error, "Login failed"));
        }
      }
    }

    throw new Error(mapAuthErrorMessage(lastError, "Invalid email/username or password. Please try again."));
  },

  /**
   * Register flow:
   * 1. Attempt Firebase accounts:signUp
   * 2. Synchronize registration with backend /auth/register
   */
  async register(username: string, email: string, password: string): Promise<AuthResponseDto> {
    const trimmedEmail = email.trim();
    const trimmedUser = username.trim();

    // 1. Primary: Firebase accounts:signUp
    try {
      const fbResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: trimmedEmail,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const fbData = await fbResponse.json();

      if (fbResponse.ok && fbData.idToken) {
        const idToken: string = fbData.idToken;
        apiClient.setAccessToken(idToken);

        // Also notify backend /auth/register or create profile
        try {
          await apiClient.post("/auth/register", {
            username: trimmedUser,
            email: trimmedEmail,
            password,
            fullName: trimmedUser,
          });
        } catch {
          // Backend sync non-blocking if already created
        }

        const roles = ["ROLE_READER"];

        if (typeof window !== "undefined") {
          
          
          
          document.cookie = `edition_access_token=${idToken}; path=/; max-age=86400; SameSite=Lax`;
        }

        return {
          token: idToken,
          refreshToken: fbData.refreshToken || "",
          username: trimmedUser,
          email: trimmedEmail,
          userId: fbData.localId,
          roles,
        };
      } else if (fbData.error?.message) {
        const msg = fbData.error.message;
        if (msg === "EMAIL_EXISTS") {
          throw new Error("This email is already registered. Please sign in instead.");
        }
        if (msg.includes("WEAK_PASSWORD")) {
          throw new Error("Password should be at least 6 characters.");
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && (err.message.includes("already registered") || err.message.includes("Password"))) {
        throw err;
      }
    }

    // 2. Fallback: Direct Backend /auth/register
    try {
      const raw = await apiClient.post<BackendAuthResponse>("/auth/register", {
        username: trimmedUser,
        email: trimmedEmail,
        password,
        fullName: trimmedUser,
      });

      if (raw && raw.accessToken) {
        const userRoles = raw.roles || parseJwtRoles(raw.accessToken);
        const resolvedUsername = raw.username || trimmedUser;

        if (typeof window !== "undefined") {
          
          
          
          document.cookie = `edition_access_token=${raw.accessToken}; path=/; max-age=86400; SameSite=Lax`;
          apiClient.setAccessToken(raw.accessToken);
        }

        return {
          token: raw.accessToken,
          refreshToken: raw.refreshToken || "",
          username: resolvedUsername,
          email: trimmedEmail,
          roles: userRoles,
        };
      }
    } catch (error) {
      throw new Error(mapAuthErrorMessage(error, "Registration failed. Please try again."));
    }

    throw new Error("Registration could not be completed. Please try again.");
  },

  /**
   * Token refresh using Firebase securetoken API or backend /auth/refresh
   */
  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    // 1. Try Firebase Secure Token Refresh
    try {
      const res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
      });
      const data = await res.json();
      if (res.ok && data.id_token) {
        const idToken: string = data.id_token;
        const newRefreshToken: string = data.refresh_token || refreshToken;
        const userRoles = parseJwtRoles(idToken);
        const username = parseJwtUsername(idToken, "user");

        if (typeof window !== "undefined") {
          
          document.cookie = `edition_access_token=${idToken}; path=/; max-age=86400; SameSite=Lax`;
          apiClient.setAccessToken(idToken);
        }

        return {
          token: idToken,
          refreshToken: newRefreshToken,
          username,
          roles: userRoles,
        };
      }
    } catch {
      // Fall through to backend /auth/refresh
    }

    // 2. Try Backend /auth/refresh
    try {
      const raw = await apiClient.post<BackendAuthResponse>("/auth/refresh", { refreshToken });
      const userRoles = raw.roles || parseJwtRoles(raw.accessToken);
      const username = raw.username || "user";

      if (typeof window !== "undefined" && raw.accessToken) {
        
        document.cookie = `edition_access_token=${raw.accessToken}; path=/; max-age=86400; SameSite=Lax`;
        apiClient.setAccessToken(raw.accessToken);
      }

      return {
        token: raw.accessToken,
        refreshToken: raw.refreshToken,
        username,
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
