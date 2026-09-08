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
 *    - Reads JWT from localStorage
 *    - Used for auth-gated mutations (login, bookmark, profile, etc.)
 *    - NEVER import apiClient in a Server Component
 */

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
const DEFAULT_API_URL = "https://api.editiontv.com/api/v1";

function getServerApiBaseUrl(): string {
  return (
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_URL
  );
}

const CLIENT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  DEFAULT_API_URL;

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
  } catch (error) {
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
  private accessToken: string | null = null;

  public setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  public getAccessToken(): string | null {
    if (!this.accessToken && typeof window !== "undefined") {
      try {
        const sessionRaw = localStorage.getItem("edition_auth_session");
        if (sessionRaw) {
          const session = JSON.parse(sessionRaw);
          if (session?.token) {
            this.accessToken = session.token;
          }
        }
        if (!this.accessToken) {
          const legacyToken = localStorage.getItem("accessToken");
          if (legacyToken) {
            this.accessToken = legacyToken;
          }
        }
      } catch {
        // Ignored — localStorage may be unavailable (private mode etc.)
      }
    }
    return this.accessToken;
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    const token = this.getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = formatUrl(CLIENT_API_BASE_URL, endpoint);

    let response: Response;
    try {
      response = await fetch(url, { ...options, headers });
    } catch (error) {
      throw new Error(
        `Network error: unable to reach ${url}. Is the backend running? (${String(error)})`
      );
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

  public delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

/**
 * Singleton for Client Component use only.
 * Import this in 'use client' files for auth-gated calls.
 */
export const apiClient = new ApiClient();
