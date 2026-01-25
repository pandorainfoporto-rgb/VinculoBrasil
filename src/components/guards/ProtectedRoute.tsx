import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore, type UserRole } from "../../stores/useAuthStore";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  // TODO: Descomentar em produção
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  // if (user && !allowedRoles.includes(user.role)) {
  //   return <Navigate to="/" replace />;
  // }

  // Para desenvolvimento, permite acesso
  return <>{children}</>;
}
