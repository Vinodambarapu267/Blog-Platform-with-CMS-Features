import { apiClient } from "./client";

function stripQuotes(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export const authApi = {
  login: async (payload: { email: string; password: string }): Promise<string> => {
    const r = await apiClient.post<string>("/api/v1/auth/login", payload, {
      responseType: "text",
    });
    return stripQuotes(r.data);
  },

  token: async (payload: { username: string; password: string }): Promise<string> => {
    const r = await apiClient.post<string>("/api/v1/auth/token", payload, {
      responseType: "text",
    });
    return stripQuotes(r.data);
  },

  validate: async (token: string): Promise<boolean> => {
    try {
      await apiClient.get("/api/v1/auth/validate", {
        params: { token },
        responseType: "text",
      });
      return true;
    } catch {
      return false;
    }
  },
};
