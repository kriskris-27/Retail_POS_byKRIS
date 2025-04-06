import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactNode } from "react";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: string[]; // Optional: allow role-based access
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    // Not logged in? Redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but role is not allowed? Redirect to unauthorized or dashboard
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children ? children : <Outlet />}</>;
};

export default ProtectedRoute;
