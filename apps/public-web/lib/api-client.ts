import { useAuthStore } from "../store/authStore";
/**
 * API Client — Edition Platform Public Web
 *
 * TWO distinct fetch patterns:
 *
 * 1. `serverFetch<T>()` — for Next.js Server Components (SSR/ISR)
 *    - Stateless, no singleton, no localStorage
 *    - Uses INTERNAL_API_URL (server→backend) or NEXT_PUBLIC_API_BASE_URL
 *    - Returns null on network failure — Server Components must never throw on fetch errors
 *    - Accepts Next.js cache options (revalidate, tags)
 *
 * 2. `apiClient` singleton — for Client Components ('use client') only
 *    - Sends the signed-in user's Firebase ID token as `Authorization: Bearer`
 *      (force-refreshes once and retries once on a 401)
 *    - Used for auth-gated mutations (bookmark, profile, etc.)
 *    - NEVER import apiClient in a Server Component
 */

import { getCurrentUser, getIdToken } from "@edition/auth";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface ApiErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  correlationId?: string;
  timestamp?: string;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly details: ApiErrorResponse;

  constructor(status: number, details: ApiErrorResponse) {
    super(details.detail || details.title || "An API error occurred");
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

// ---------------------------------------------------------------------------
// URL resolution
// ---------------------------------------------------------------------------

/**
 * For Server Components: prefers INTERNAL_API_URL (Docker / k8s internal routing),
 * falls back to NEXT_PUBLIC_API_BASE_URL for local development.
 * Never exposed to the browser.
 */
function getServerApiBaseUrl(): string {
  return (
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  );
}

const CLIENT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "";


// ---------------------------------------------------------------------------
// 1. serverFetch — use ONLY in Server Components
// ---------------------------------------------------------------------------

export interface ServerFetchOptions extends RequestInit {
  /** Next.js ISR revalidation in seconds. 0 = no-store, undefined = force-cache */
  revalidate?: number | false;
  /** Next.js cache tags for on-demand revalidation */
  tags?: string[];
}

function formatUrl(baseUrl: string, endpoint: string): string {
  if (endpoint.startsWith("http")) return endpoint;
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  if (cleanBase.endsWith("/api/v1") && cleanEndpoint.startsWith("/api/v1")) {
    return `${cleanBase.slice(0, -7)}${cleanEndpoint}`;
  }
  return `${cleanBase}${cleanEndpoint}`;
}

/**
 * Server-safe fetch wrapper for use in Next.js Server Components.
 * Returns null on any network or HTTP error — never throws.
 * Logs errors server-side for observability.
 */
export async function serverFetch<T>(
  endpoint: string,
  options: ServerFetchOptions = {}
): Promise<T | null> {
  const { revalidate, tags, ...fetchOptions } = options;
  const baseUrl = getServerApiBaseUrl();
  const url = formatUrl(baseUrl, endpoint);

  if (!url.startsWith("http")) {
    // If baseUrl was empty, url will be relative. Next.js fetches to relative URLs
    // during static generation can cause severe deadlocks (hanging for 60s).
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[serverFetch] Skipped relative fetch to prevent deadlock: ${url}`);
    }
    return null;
  }

  const nextCache: RequestInit["next"] = {};
  if (revalidate !== undefined) {
    nextCache.revalidate = revalidate;
  } else if (fetchOptions.cache === "no-store") {
    nextCache.revalidate = 0;
  }
  if (tags && tags.length > 0) {
    nextCache.tags = tags;
  }

  const cacheMode: RequestInit["cache"] =
    revalidate === 0 || revalidate === false ? "no-store" : fetchOptions.cache;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      cache: cacheMode,
      headers: {
        "Content-Type": "application/json",
        ...(fetchOptions.headers as Record<string, string>),
      },
      next: Object.keys(nextCache).length > 0 ? nextCache : undefined,
    });

    if (!response.ok) {
      // 404s and other expected errors: log and return null gracefully
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[serverFetch] ${response.status} ${response.statusText} — ${url}`
        );
      }
      return null;
    }

    if (response.status === 204) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    // Network failures (backend down, DNS failure, etc.) — never crash the page, fall back to default UI
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[serverFetch] Service unreachable — ${url}`);
    }
    return null;
  }
}

// ---------------------------------------------------------------------------
// 2. ApiClient — use ONLY in Client Components ('use client')
// ---------------------------------------------------------------------------

class ApiClient {
  /** Firebase ID token for the signed-in user, or null. */
  public getAccessToken(forceRefresh = false): Promise<string | null> {
    return getIdToken(forceRefresh);
  }

  /** Synchronous check: is a Firebase user currently signed in? */
  public isAuthenticated(): boolean {
    return getCurrentUser() !== null;
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = formatUrl(CLIENT_API_BASE_URL, endpoint);

    const buildHeaders = (token: string | null): Record<string, string> => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      return headers;
    };

    if (!url.startsWith("http")) {
      throw new Error(`API URL is not configured. Attempted to fetch relative path: ${url}`);
    }

    const doFetch = async (token: string | null): Promise<Response> => {
      try {
        return await fetch(url, { ...options, headers: buildHeaders(token) });
      } catch (error) {
        throw new Error(
          `Network error: unable to reach ${url}. Is the backend running? (${String(error)})`
        );
      }
    };

    const token = await this.getAccessToken();
    let response = await doFetch(token);

    // Expired/invalid ID token: force-refresh once and retry once.
    if (response.status === 401 && token) {
      const fresh = await this.getAccessToken(true);
      if (fresh) {
        response = await doFetch(fresh);
      }
    }

    if (!response.ok) {
      let errorData: ApiErrorResponse;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          type: "about:blank",
          title: response.statusText || "Error",
          status: response.status,
          detail: `HTTP ${response.status} from ${endpoint}`,
        };
      }
      
      // Global Interceptors
      if (typeof window !== "undefined") {
        if (response.status === 401) {
          useAuthStore.getState().clearSession();
          window.dispatchEvent(new CustomEvent("edition_auth_changed"));
          window.location.href = "/auth/login?expired=true";
        } else if (response.status === 403) {
          console.error("403 Forbidden");
          // Components should handle 403 or error boundary will catch the ApiError
        } else if (response.status === 404) {
          // Components should handle 404 or boundary will catch
        }
      }

      throw new ApiError(response.status, errorData);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  public get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T>(
    endpoint: string,
    body?: unknown,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T>(
    endpoint: string,
    body?: unknown,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T>(
    endpoint: string,
    body?: unknown,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

/**
 * Singleton for Client Component use only.
 * Import this in 'use client' files for auth-gated calls.
 */
export const apiClient = new ApiClient();
