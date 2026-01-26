import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
import { useAuth } from "@/contexts/AuthContext";
import Maintenance from "@/pages/Maintenance";

interface MaintenanceGuardProps {
  children: ReactNode;
}

// Routes that should ALWAYS be accessible during maintenance
const EXCLUDED_ROUTES = [
  "/admin",
  "/auth/login",
  "/auth/signup", 
  "/business/login",
  "/business/signup",
  "/reset-password",
];

const MaintenanceGuard = ({ children }: MaintenanceGuardProps) => {
  const location = useLocation();
  const { isMaintenanceMode, isLoading } = useMaintenanceMode();
  const { role, isSuperAdmin, isLoading: isAuthLoading } = useAuth();

  // Don't block while loading
  if (isLoading || isAuthLoading) {
    return <>{children}</>;
  }

  // Check if current route is excluded from maintenance redirect
  const isExcludedRoute = EXCLUDED_ROUTES.some(route => 
    location.pathname.startsWith(route)
  );

  // Bypass logic:
  // 1. If route is excluded (login pages, admin routes) -> Allow
  // 2. If user is admin or super admin -> Allow
  // 3. Otherwise during maintenance -> Show maintenance page
  if (isMaintenanceMode) {
    const isAdmin = role === "admin" || isSuperAdmin;
    
    if (!isExcludedRoute && !isAdmin) {
      return <Maintenance />;
    }
  }

  return <>{children}</>;
};

export default MaintenanceGuard;
