import { useEffect, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/auth-context";
import { ROUTES } from "@/constants";
import type { Role } from "@/types";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  const isForbidden =
    isAuthenticated && !!allowedRoles && !!user && !allowedRoles.includes(user.role);

  useEffect(() => {
    if (isForbidden) {
      toast.error("You don't have permission to access that page.", { id: "forbidden-route" });
    }
  }, [isForbidden]);

  
  if (isLoading) {
    return (
      <div className="bg-ambient flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }

  if (isForbidden) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return <>{children}</>;
}
