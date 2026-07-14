import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from "react";
import toast from "react-hot-toast";
import { authApi } from "@/api/auth";
import { AUTH_TOKEN_KEY } from "@/constants";
import type { Role } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────
export interface SessionUser {
  username: string;
  role: Role;
  exp: number;      
  iat: number;   
}

interface AuthContextValue {
  user: SessionUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithUsername: (username: string, password: string) => Promise<void>;
  logout: (reason?: "expired" | "unauthorized") => void;
}

// ── JWT decode ────────────────────────────────────────────────────────────
// JWT structure from JwtUtil.java:
//   { sub: username, role: "AUTHOR"|"READER"|..., iat: epochSeconds, exp: iat+3600 }
function decodeToken(token: string): SessionUser | null {
  try {
    // JWT is three base64url segments separated by dots.
    // The middle segment is the payload.
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // base64url → base64 → decode
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));

    return {
      username: payload.sub as string,       // JwtUtil uses setSubject(username)
      role: (payload.role ?? "READER") as Role, // JwtUtil adds .claim("role", role)
      exp: payload.exp as number,
      iat: payload.iat as number,
    };
  } catch {
    return null;
  }
}

function isTokenExpired(user: SessionUser): boolean {
  // exp is in seconds, Date.now() is in milliseconds
  return Date.now() / 1000 > user.exp;
}

// ── Context ───────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialise from localStorage synchronously — but we'll validate against
  // the server async on mount before trusting the stored token.
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [user, setUser] = useState<SessionUser | null>(() => {
    const stored = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!stored) return null;
    const decoded = decodeToken(stored);
    // Quick client-side expiry check on init — avoids a flash of "authenticated"
    // for an obviously expired token even before the server check completes.
    if (!decoded || isTokenExpired(decoded)) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return null;
    }
    return decoded;
  });
  const [isLoading, setIsLoading] = useState(false);
  // True while we're waiting for the server-side validate call on mount
  const [isValidating, setIsValidating] = useState(Boolean(localStorage.getItem(AUTH_TOKEN_KEY)));

  // ── Apply a newly received token ────────────────────────────────────────
  const applyToken = useCallback((rawToken: string) => {
    const decoded = decodeToken(rawToken);
    if (!decoded) throw new Error("Received an invalid token from the server");
    localStorage.setItem(AUTH_TOKEN_KEY, rawToken);
    setToken(rawToken);
    setUser(decoded);
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────
  // The backend issues a 1-hour JWT with no refresh endpoint (see Auth-service —
  // there's no /refresh route), so sessions silently go stale. Previously that
  // meant getting bounced to /login with zero explanation mid-edit/mid-click.
  // Surface *why* whenever it's not a deliberate "Sign out" click.
  const logout = useCallback((reason?: "expired" | "unauthorized") => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
    if (reason === "expired") {
      toast.error("Your session expired — please sign in again.", { id: "session-expired" });
    } else if (reason === "unauthorized") {
      toast.error("You were signed out — please sign in again.", { id: "session-expired" });
    }
  }, []);

  // Listen for the global auth:logout event fired by the axios interceptor
  // when it gets a 401 from the server.
  useEffect(() => {
    const handler = () => logout("unauthorized");
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [logout]);

  // ── Server-side token validation on mount ───────────────────────────────
  // Even if the client-side expiry check passes, we validate with the server
  // on startup so a rotated JWT_SECRET_KEY or revoked token is caught immediately.
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!storedToken) {
      setIsValidating(false);
      return;
    }
    let cancelled = false;
    authApi.validate(storedToken).then((valid) => {
      if (cancelled) return;
      if (!valid) {
        logout("expired");
      }
      setIsValidating(false);
    });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-logout when token expires (client-side timer) ──────────────────
  useEffect(() => {
    if (!user) return;
    const msUntilExpiry = user.exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) { logout("expired"); return; }
    const timer = setTimeout(() => {
      logout("expired");
    }, msUntilExpiry);
    return () => clearTimeout(timer);
  }, [user, logout]);

  // ── Login flows ─────────────────────────────────────────────────────────
  // /api/v1/auth/login — email + password (standard user flow)
  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const rawToken = await authApi.login({ email, password });
      applyToken(rawToken);
    } finally {
      setIsLoading(false);
    }
  }, [applyToken]);

  // /api/v1/auth/token — username + password (Spring Security AuthenticationManager)
  const loginWithUsername = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const rawToken = await authApi.token({ username, password });
      applyToken(rawToken);
    } finally {
      setIsLoading(false);
    }
  }, [applyToken]);

  // ── Context value ────────────────────────────────────────────────────────
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      // Not authenticated while we're still validating the stored token,
      // or if no token / user decoded from it.
      isAuthenticated: !isValidating && Boolean(token) && Boolean(user),
      isLoading: isLoading || isValidating,
      loginWithEmail,
      loginWithUsername,
      logout,
    }),
    [user, token, isLoading, isValidating, loginWithEmail, loginWithUsername, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
