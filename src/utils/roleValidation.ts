import { supabase } from "@/integrations/supabase/client";

export type RoleType = "customer" | "seller" | "admin";

interface RoleConflictResult {
  hasConflict: boolean;
  existingRole: RoleType | null;
  displayName: string | null;
}

/**
 * Check if an email already exists with a different role
 * This enforces the one-email-one-role policy
 */
export const checkEmailRoleConflict = async (
  email: string,
  targetRole: RoleType
): Promise<RoleConflictResult> => {
  try {
    const { data, error } = await supabase.rpc("check_email_role_conflict", {
      p_email: email.toLowerCase().trim(),
      p_target_role: targetRole,
    });

    if (error) {
      console.error("Error checking email role conflict:", error);
      return { hasConflict: false, existingRole: null, displayName: null };
    }

    if (data && data.length > 0 && data[0].has_conflict) {
      const existingRole = data[0].existing_role as RoleType;
      const displayName = getRoleDisplayName(existingRole);
      return { hasConflict: true, existingRole, displayName };
    }

    return { hasConflict: false, existingRole: null, displayName: null };
  } catch (error) {
    console.error("Error in checkEmailRoleConflict:", error);
    return { hasConflict: false, existingRole: null, displayName: null };
  }
};

/**
 * Get display name for a role
 */
export const getRoleDisplayName = (role: RoleType): string => {
  switch (role) {
    case "customer":
      return "Customer";
    case "seller":
      return "Business Partner";
    case "admin":
      return "Administrator";
    default:
      return "User";
  }
};

/**
 * Check if current role can access specific account pages
 */
export const canAccessAccountPage = (role: RoleType | null, path: string): boolean => {
  if (!role) return false;

  // Customer account pages - only accessible by customers
  const customerOnlyPages = [
    "/account/profile",
    "/account/orders",
    "/account/wishlist",
    "/account/addresses",
    "/account/notifications",
    "/account/messages",
    "/my-orders",
  ];

  // Seller pages - only accessible by sellers
  const sellerOnlyPages = ["/seller"];

  // Admin pages - only accessible by super admin
  const adminOnlyPages = ["/admin"];

  // Check if path starts with any customer-only prefix
  const isCustomerPage = customerOnlyPages.some(
    (prefix) => path === prefix || path.startsWith(prefix + "/")
  );

  // Check if path starts with seller prefix
  const isSellerPage = sellerOnlyPages.some(
    (prefix) => path === prefix || path.startsWith(prefix + "/")
  );

  // Check if path starts with admin prefix
  const isAdminPage = adminOnlyPages.some(
    (prefix) => path === prefix || path.startsWith(prefix + "/")
  );

  if (isCustomerPage) {
    return role === "customer";
  }

  if (isSellerPage) {
    return role === "seller" || role === "admin";
  }

  if (isAdminPage) {
    return role === "admin";
  }

  // All other pages are accessible
  return true;
};

/**
 * Get the appropriate redirect path based on role
 */
export const getRoleRedirectPath = (role: RoleType | null): string => {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "seller":
      return "/seller/dashboard";
    case "customer":
      return "/";
    default:
      return "/";
  }
};
