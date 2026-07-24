import type { AuthUser } from "./types";
const TOKEN_KEY = "guestbook_token";
const USER_KEY = "guestbook_user";
export function getToken(): string | null { return typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY); }
export function getStoredUser(): AuthUser | null { if (typeof window === "undefined") return null; try { const raw=localStorage.getItem(USER_KEY); return raw ? JSON.parse(raw) as AuthUser : null; } catch { return null; } }
export function saveAuth(token: string, user: AuthUser): void { localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(USER_KEY, JSON.stringify(user)); }
export function clearAuth(): void { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }
