import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthWrapper";
import { LoadingOverlay } from "./LoadingOverlay";

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: Props) => {
  const { user, claims } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !claims?.admin) {
    return <Navigate to="/Dashboard" replace />;
  }

  if (!claims) {
    return <LoadingOverlay />;
  }

  return <>{children}</>;
};
