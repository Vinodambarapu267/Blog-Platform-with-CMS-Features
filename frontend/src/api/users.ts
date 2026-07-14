import { apiClient } from "./client";
import type { User, UserCreateRequest, UserStatus, ResponseMessage } from "@/types";

export const usersApi = {
  // POST /api/v1/users/createuser
  // Returns UserResponseDto directly (no ResponseMessage wrapper) — UserController returns it raw.
  // socialLinks URLs MUST start with "https://" — UserServiceImpl silently drops others.
  create: (payload: UserCreateRequest) =>
    apiClient.post<User>("/api/v1/users/createuser", payload).then((r) => r.data),

  // PUT /api/v1/users/updateuser/me
  // UserController wraps in ResponseMessage<UserResponseDto> on success.
  // UserDto fields: userId, username, displayName, bio, socialLinks, status, email, createdAt, updatedAt, postIds
  // DO NOT send password — UserServiceImpl.updateUser publishes user-updated Kafka event
  // with updatedUser.getPassword() (the BCrypt hash). Auth-service would then double-encode it,
  // corrupting the stored credential. Omit password entirely from this call.
  updateMe: (payload: Partial<User>) =>
    apiClient
      .put<ResponseMessage<User>>("/api/v1/users/updateuser/me", payload)
      .then((r) => {
        // ResponseMessage<UserResponseDto> shape: { statuscode, status, message, data }
        if (r.data && typeof r.data === "object" && "data" in r.data) {
          return r.data.data as User;
        }
        // Fallback if backend returns UserResponseDto directly
        return r.data as unknown as User;
      }),

  // GET /api/v1/users/findbyname/{username}
  // Open GET (RouteValidator OPEN_GET_ENDPOINTS includes /api/v1/users/**)
  // Returns UserResponseDto directly
  findByUsername: (username: string) =>
    apiClient.get<User>(`/api/v1/users/findbyname/${username}`).then((r) => r.data),

  // GET /api/v1/users/{userId}
  // Requires USER_READ authority. Returns UserDto (not UserResponseDto — different shape).
  // UserDto has: userId, username, displayName, bio, socialLinks, status, email, createdAt, updatedAt, postIds
  findById: (userId: number) =>
    apiClient.get<User>(`/api/v1/users/${userId}`).then((r) => r.data),

  // GET /api/v1/users
  // Open GET (RouteValidator). Returns ResponseMessage<List<UserResponseDto>>
  // { statuscode, status, message, data: UserResponseDto[] }
  list: () =>
    apiClient
      .get<ResponseMessage<User[]>>("/api/v1/users")
      .then((r) => {
        // Handle both: direct array or wrapped in ResponseMessage.data
        if (Array.isArray(r.data)) return r.data as unknown as User[];
        return (r.data.data ?? []) as User[];
      }),

  // PUT /api/v1/users/updateStatus?username=&status=
  // Requires USER_UPDATE authority. Returns UserResponseDto directly.
  updateStatus: (username: string, status: UserStatus) =>
    apiClient
      .put<User>("/api/v1/users/updateStatus", null, { params: { username, status } })
      .then((r) => r.data),

  // DELETE /api/v1/users/deleteuser/{username}
  // Requires USER_DELETE authority. Returns plain String "user deleted successfully".
  remove: (username: string) =>
    apiClient.delete<string>(`/api/v1/users/deleteuser/${username}`).then((r) => r.data),
};
