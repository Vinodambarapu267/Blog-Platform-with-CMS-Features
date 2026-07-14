import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { usersApi } from "@/api/users";
import { useAuth } from "@/contexts/auth-context";
import type { User, UserStatus } from "@/types";

export const userKeys = {
  all: ["users"] as const,
  byUsername: (username: string) => ["users", "byUsername", username] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: () => usersApi.list(),
  });
}

export function useCurrentUser() {
  const { user } = useAuth();
  return useQuery({
    queryKey: userKeys.byUsername(user?.username ?? ""),
    queryFn: () => usersApi.findByUsername(user!.username),
    enabled: Boolean(user?.username),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ username, status }: { username: string; status: UserStatus }) =>
      usersApi.updateStatus(username, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("User status updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => usersApi.remove(username),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("User deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<User>) => usersApi.updateMe(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Profile updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
