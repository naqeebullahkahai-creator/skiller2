import { ReactNode } from "react";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
import { useAuth } from "@/contexts/AuthContext";
import Maintenance from "@/pages/Maintenance";

interface MaintenanceGuardProps {
  children: ReactNode;
}

const MaintenanceGuard = ({ children }: MaintenanceGuardProps) => {
  const { isMaintenanceMode, isLoading } = useMaintenanceMode();
  const { isSuperAdmin, isLoading: isAuthLoading } = useAuth();

  // Don't block while loading
  if (isLoading || isAuthLoading) {
    return <>{children}</>;
  }

  // If maintenance mode is on and user is NOT super admin, show maintenance page
  if (isMaintenanceMode && !isSuperAdmin) {
    return <Maintenance />;
  }

  return <>{children}</>;
};

export default MaintenanceGuard;
