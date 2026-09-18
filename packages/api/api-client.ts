import { getCurrentUser, getIdToken } from "@edition/auth";

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
    super(details.detail || details.title || 'An API error occurred');
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://api1.editiontv.com/api/v1";

/** Backend origin without the `/api/v1` suffix (for endpoints mounted at the root, e.g. `/internal/**`). */
export const API_ORIGIN = API_BASE_URL.replace(/\/+$/, "").replace(/\/api\/v1$/, "");

/**
 * Browser API client. Attaches `Authorization: Bearer <Firebase ID token>`
 * whenever a user is signed in; on a 401 it force-refreshes the token once and
 * retries once. Server-side callers have no browser user and go unauthenticated.
 */
class ApiClient {
  /** Firebase ID token for the signed-in user, or null. */
  public getAccessToken(forceRefresh = false): Promise<string | null> {
    return getIdToken(forceRefresh);
  }

  /** Synchronous check: is a Firebase user currently signed in? */
  public isAuthenticated(): boolean {
    return getCurrentUser() !== null;
  }

  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    const buildHeaders = (token: string | null): Record<string, string> => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      return headers;
    };

    let token = await this.getAccessToken();
    let response = await fetch(url, { ...options, headers: buildHeaders(token) });

    if (response.status === 401 && token) {
      const fresh = await this.getAccessToken(true);
      if (fresh) {
        token = fresh;
        response = await fetch(url, { ...options, headers: buildHeaders(token) });
      }
    }

    if (!response.ok) {
      let errorData: ApiErrorResponse;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          type: 'about:blank',
          title: response.statusText || 'Error',
          status: response.status,
          detail: `HTTP Request failed with status ${response.status}`,
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
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, body?: unknown, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T>(endpoint: string, body?: unknown, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T>(endpoint: string, body?: unknown, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
