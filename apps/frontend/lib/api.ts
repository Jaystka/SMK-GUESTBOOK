import { clearAuth, getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";
export class ApiError extends Error { constructor(message: string, public status: number, public payload?: unknown) { super(message); } }

type ApiOptions = RequestInit & { auth?: boolean };
export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (options.auth) { const token = getToken(); if (token) headers.set("Authorization", `Bearer ${token}`); }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers, cache: "no-store" });
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    if (response.status === 401 && options.auth) clearAuth();
    const message = typeof payload === "object" && payload && "message" in payload ? String((payload as {message: unknown}).message) : `Request failed (${response.status})`;
    throw new ApiError(message, response.status, payload);
  }
  return payload as T;
}
export { API_URL };
