import { ReactNode } from "react";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
import { useAuth } from "@/contexts/AuthContext";
import Maintenance from "@/pages/Maintenance";

interface MaintenanceGuardProps {
  children: ReactNode;
}

const MaintenanceGuard = ({ children }: MaintenanceGuardProps) => {
  const { maintenanceConfig, isLoading } = useMaintenanceMode();
  const { role, isSuperAdmin, isLoading: isAuthLoading } = useAuth();

  // Don't block while loading
  if (isLoading || isAuthLoading) {
    return <>{children}</>;
  }

  // If maintenance mode is on, check if user has access
  if (maintenanceConfig.isEnabled) {
    // Super admin always has access
    if (isSuperAdmin) return <>{children}</>;

    // Check if user's role is in the allowed roles list
    const userRole = role || 'guest';
    if (maintenanceConfig.allowedRoles.includes(userRole)) {
      return <>{children}</>;
    }

    // Block access - show maintenance page
    return <Maintenance />;
  }

  return <>{children}</>;
};

export default MaintenanceGuard;
