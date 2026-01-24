import { ReactNode } from "react";
import { usePermissions } from "@/contexts/PermissionsContext";
import { PermissionFeature, PermissionAction } from "@/hooks/useRoleManagement";
import { useAuth } from "@/contexts/AuthContext";

interface PermissionGuardProps {
  feature: PermissionFeature;
  action: PermissionAction;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Guard component that conditionally renders children based on user permissions.
 * Always allows access for super admins.
 */
const PermissionGuard = ({ 
  feature, 
  action, 
  children, 
  fallback = null 
}: PermissionGuardProps) => {
  const { hasPermission, isLoading } = usePermissions();
  const { isSuperAdmin } = useAuth();
  
  // Super admin always has access
  if (isSuperAdmin) {
    return <>{children}</>;
  }
  
  // Still loading permissions
  if (isLoading) {
    return null;
  }
  
  // Check permission
  if (hasPermission(feature, action)) {
    return <>{children}</>;
  }
  
  // No permission, render fallback
  return <>{fallback}</>;
};

export default PermissionGuard;
