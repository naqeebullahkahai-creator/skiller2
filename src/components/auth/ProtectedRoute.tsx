import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole, SUPER_ADMIN_EMAIL } from "@/contexts/AuthContext";
import { FanzonSpinner } from "@/components/ui/fanzon-spinner";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireSuperAdmin?: boolean;
}

const ProtectedRoute = ({ children, allowedRoles, requireSuperAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, role, user, isSuperAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-2xl font-bold text-primary tracking-tight mb-4">FANZON</div>
        <FanzonSpinner size="lg" />
        <p className="text-sm text-muted-foreground mt-4 animate-pulse">Authenticating...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to auth page with return URL
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check for super admin requirement (for admin routes)
  if (requireSuperAdmin || (allowedRoles?.includes("admin") && location.pathname.startsWith("/admin"))) {
    if (!isSuperAdmin) {
      // Log unauthorized access attempt
      console.warn(`Unauthorized admin access attempt by: ${user?.email} to ${location.pathname}`);
      return <Navigate to="/forbidden" replace />;
    }
  }

  // If specific roles are required, check if user has one of them
  if (allowedRoles && allowedRoles.length > 0) {
    // For admin role, must also be super admin
    if (allowedRoles.includes("admin") && !isSuperAdmin) {
      return <Navigate to="/forbidden" replace />;
    }
    
    if (!role || !allowedRoles.includes(role)) {
      // User doesn't have required role - redirect based on their actual role
      if (role === "seller") {
        return <Navigate to="/seller/dashboard" replace />;
      } else if (role === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
