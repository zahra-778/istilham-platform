/**
 * Transport layer connected to Istilham Backend REST API
 */

export const API_BASE_URL = "http://localhost:4000/api";
export const TOKEN_STORAGE_KEY = "istilham.token";
export const USER_STORAGE_KEY = "istilham.session";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

/** Simulates realistic network latency for local fallbacks if needed */
export function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers as Record<string, string> | undefined),
  };

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${cleanPath}`;

  try {
    const response = await fetch(url, {
      ...init,
      headers,
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = json?.error || json?.message || "تعذّر إكمال الطلب، يرجى المحاولة مرة أخرى.";
      throw new Error(errorMsg);
    }

    // Unwrap { success: true, data: T } or return raw json
    if (json && typeof json === "object" && "success" in json && "data" in json) {
      return json.data as T;
    }

    return json as T;
  } catch (err: any) {
    if (err.message) throw err;
    throw new Error("تعذّر الاتصال بخادم استلهام، يرجى التأكد من تشغيل السيرفر.");
  }
}
