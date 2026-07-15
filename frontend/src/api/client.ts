import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, AUTH_TOKEN_KEY } from "@/constants";
import type { ApiError } from "@/types";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" }
});

// ── Request interceptor — attach JWT ────────────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// ── Response interceptor — error normalisation + 401 handling ───────────────
//
// The backend's auth flow:
//   • Gateway validates JWT via JwtUtil.validateToken() before forwarding
//   • Downstream services re-validate via JwtAuthenticationFilter
//   • A missing/expired/invalid token → 401 from either layer
//   • Wrong permissions → 403 from @PreAuthorize
//   • Rate limit exceeded → 429
//
// There is no refresh-token endpoint in Auth-service (JWT is 1-hour, no rotation).
// On 401 we clear the stored token and fire "auth:logout" so AuthProvider
// can update state and ProtectedRoute can redirect to /login.

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError | string>) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      // Let AuthProvider know — it listens for this event to clear user state
      window.dispatchEvent(new Event("auth:logout"));
    }

    // Extract the most useful message from whatever the backend sent back
    let message: string;
    const data = error.response?.data;

    if (typeof data === "string" && data.length > 0) {
      // Plain text error (e.g. "missing authorization header" from Gateway)
      message = data;
    } else if (data && typeof data === "object" && "message" in data) {
      // ResponseMessage / ApiError shape: { message: "..." }
      message = (data as ApiError).message;
    } else if (status === 403) {
      message = "You don't have permission to do that.";
    } else if (status === 429) {
      message = "Too many requests — please wait a moment and try again.";
    } else if (status === 401) {
      message = "Your session has expired. Please sign in again.";
    } else if (error.code === "ECONNABORTED") {
      message = "Request timed out. Is the backend running?";
    } else if (error.code === "ERR_NETWORK" || !error.response) {
      message = "Cannot reach the server. Check that Api-Gateway is running on port 8089.";
    } else {
      message = `Server error (${status ?? "unknown"})`;
    }

    return Promise.reject(new Error(message));
  }
);
