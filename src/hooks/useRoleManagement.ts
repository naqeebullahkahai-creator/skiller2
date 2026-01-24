import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type PermissionFeature = 
  | 'banners'
  | 'products'
  | 'orders'
  | 'payouts'
  | 'flash_sales'
  | 'users'
  | 'categories'
  | 'reviews'
  | 'returns'
  | 'analytics'
  | 'settings'
  | 'vouchers';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

export interface StaffRole {
  id: string;
  name: string;
  description: string | null;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  feature: PermissionFeature;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface StaffRoleAssignment {
  id: string;
  user_id: string;
  role_id: string;
  assigned_by: string | null;
  assigned_at: string;
  role?: StaffRole;
}

export interface UserPermissions {
  feature: PermissionFeature;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

// Fetch all staff roles
export const useStaffRoles = () => {
  return useQuery({
    queryKey: ["staff-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_roles")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as StaffRole[];
    },
  });
};

// Fetch role permissions
export const useRolePermissions = (roleId: string | null) => {
  return useQuery({
    queryKey: ["role-permissions", roleId],
    queryFn: async () => {
      if (!roleId) return [];
      
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*")
        .eq("role_id", roleId);
      
      if (error) throw error;
      return data as RolePermission[];
    },
    enabled: !!roleId,
  });
};

// Fetch current user's permissions
export const useUserPermissions = () => {
  const { user, isSuperAdmin } = useAuth();
  
  return useQuery({
    queryKey: ["user-permissions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Super admin has all permissions
      if (isSuperAdmin) {
        const allFeatures: PermissionFeature[] = [
          'banners', 'products', 'orders', 'payouts', 'flash_sales',
          'users', 'categories', 'reviews', 'returns', 'analytics',
          'settings', 'vouchers'
        ];
        
        return allFeatures.map(feature => ({
          feature,
          can_view: true,
          can_create: true,
          can_edit: true,
          can_delete: true,
        }));
      }
      
      const { data, error } = await supabase.rpc("get_user_permissions", {
        _user_id: user.id,
      });
      
      if (error) {
        console.error("Error fetching permissions:", error);
        return [];
      }
      
      return data as UserPermissions[];
    },
    enabled: !!user?.id,
  });
};

// Check if user has a specific permission
export const useHasPermission = () => {
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
  
  return { hasPermission, isLoading };
};

// Fetch all staff role assignments
export const useStaffRoleAssignments = () => {
  return useQuery({
    queryKey: ["staff-role-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_role_assignments")
        .select(`
          *,
          role:staff_roles(*)
        `)
        .order("assigned_at", { ascending: false });
      
      if (error) throw error;
      return data as StaffRoleAssignment[];
    },
  });
};

// Get user's staff role assignment
export const useUserStaffRole = (userId: string | null) => {
  return useQuery({
    queryKey: ["user-staff-role", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("staff_role_assignments")
        .select(`
          *,
          role:staff_roles(*)
        `)
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error) throw error;
      return data as StaffRoleAssignment | null;
    },
    enabled: !!userId,
  });
};

// Mutations for role management
export const useRoleMutations = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const assignRole = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      // First check if user already has a role
      const { data: existing } = await supabase
        .from("staff_role_assignments")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (existing) {
        // Update existing assignment
        const { error } = await supabase
          .from("staff_role_assignments")
          .update({ role_id: roleId, assigned_by: user?.id })
          .eq("user_id", userId);
        
        if (error) throw error;
      } else {
        // Create new assignment
        const { error } = await supabase
          .from("staff_role_assignments")
          .insert({
            user_id: userId,
            role_id: roleId,
            assigned_by: user?.id,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-role-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["user-staff-role"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role assigned successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to assign role");
    },
  });
  
  const removeRole = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("staff_role_assignments")
        .delete()
        .eq("user_id", userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-role-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["user-staff-role"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role removed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove role");
    },
  });
  
  const createRole = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      const { data, error } = await supabase
        .from("staff_roles")
        .insert({ name, description })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-roles"] });
      toast.success("Role created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create role");
    },
  });
  
  const updateRolePermissions = useMutation({
    mutationFn: async ({ roleId, permissions }: { 
      roleId: string; 
      permissions: Partial<RolePermission>[] 
    }) => {
      // Delete existing permissions
      await supabase
        .from("role_permissions")
        .delete()
        .eq("role_id", roleId);
      
      // Insert new permissions
      if (permissions.length > 0) {
        const { error } = await supabase
          .from("role_permissions")
          .insert(
            permissions.map(p => ({
              role_id: roleId,
              feature: p.feature,
              can_view: p.can_view || false,
              can_create: p.can_create || false,
              can_edit: p.can_edit || false,
              can_delete: p.can_delete || false,
            }))
          );
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
      queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
      toast.success("Permissions updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update permissions");
    },
  });
  
  const deleteRole = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from("staff_roles")
        .delete()
        .eq("id", roleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-roles"] });
      toast.success("Role deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete role");
    },
  });
  
  return {
    assignRole,
    removeRole,
    createRole,
    updateRolePermissions,
    deleteRole,
  };
};
