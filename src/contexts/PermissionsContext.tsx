import { createContext, useContext, ReactNode } from "react";
import { useUserPermissions, PermissionFeature, PermissionAction, UserPermissions } from "@/hooks/useRoleManagement";
import { useAuth } from "@/contexts/AuthContext";

interface PermissionsContextType {
  permissions: UserPermissions[];
  isLoading: boolean;
  hasPermission: (feature: PermissionFeature, action: PermissionAction) => boolean;
  canView: (feature: PermissionFeature) => boolean;
  canCreate: (feature: PermissionFeature) => boolean;
  canEdit: (feature: PermissionFeature) => boolean;
  canDelete: (feature: PermissionFeature) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
};

export const PermissionsProvider = ({ children }: { children: ReactNode }) => {
  const { data: permissions = [], isLoading } = useUserPermissions();
  const { isSuperAdmin } = useAuth();
  
  const hasPermission = (feature: PermissionFeature, action: PermissionAction): boolean => {
    if (isSuperAdmin) return true;
    
    const perm = permissions.find(p => p.feature === feature);
    if (!perm) return false;
    
    switch (action) {
      case 'view': return perm.can_view;
      case 'create': return perm.can_create;
      case 'edit': return perm.can_edit;
      case 'delete': return perm.can_delete;
      default: return false;
    }
  };
  
  const canView = (feature: PermissionFeature) => hasPermission(feature, 'view');
  const canCreate = (feature: PermissionFeature) => hasPermission(feature, 'create');
  const canEdit = (feature: PermissionFeature) => hasPermission(feature, 'edit');
  const canDelete = (feature: PermissionFeature) => hasPermission(feature, 'delete');
  
  return (
    <PermissionsContext.Provider value={{
      permissions,
      isLoading,
      hasPermission,
      canView,
      canCreate,
      canEdit,
      canDelete,
    }}>
      {children}
    </PermissionsContext.Provider>
  );
};
