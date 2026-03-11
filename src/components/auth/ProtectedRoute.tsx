import { ReactNode, useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useImpersonation } from "@/contexts/ImpersonationContext";
import { FanzonSpinner } from "@/components/ui/fanzon-spinner";
import { useToast } from "@/hooks/use-toast";
import { canAccessAccountPage, getRoleRedirectPath } from "@/utils/roleValidation";
import { isDomainAllowedForRole, getCrossDomainRedirectUrl, isProductionDomain } from "@/utils/domainRouting";
import { buildCrossDomainUrl } from "@/utils/crossDomainAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireSuperAdmin?: boolean;
}

const ProtectedRoute = ({ children, allowedRoles, requireSuperAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, role: actualRole, user, isSuperAdmin } = useAuth();
  const { isImpersonating, impersonatedUser } = useImpersonation();
  
  // When impersonating, use the impersonated user's role for access checks
  const role = isImpersonating ? impersonatedUser?.role || actualRole : actualRole;
  const location = useLocation();
  const { toast } = useToast();
  const hasShownToast = useRef(false);
  const hasTriedDomainRedirect = useRef(false);

  // If user is on wrong domain, redirect them to the correct one instead of showing "Access Denied"
  useEffect(() => {
    if (isLoading || !isAuthenticated || !actualRole || hasTriedDomainRedirect.current || isImpersonating) return;
    
    if (!isDomainAllowedForRole(actualRole) && isProductionDomain()) {
      hasTriedDomainRedirect.current = true;
      const targetUrl = getCrossDomainRedirectUrl(actualRole);
      if (targetUrl) {
        buildCrossDomainUrl(targetUrl).then((ssoUrl) => {
          window.location.replace(ssoUrl);
        });
      }
    }
  }, [isLoading, isAuthenticated, role]);

  // Show permission denied toast
  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasShownToast.current) {
      if (location.pathname.startsWith("/admin") && !isSuperAdmin) {
        hasShownToast.current = true;
        toast({ title: "Access Denied", description: "You don't have permission to access the Admin Dashboard.", variant: "destructive" });
      } else if (location.pathname.startsWith("/seller") && role === "customer") {
        hasShownToast.current = true;
        toast({ title: "Access Denied", description: "This section is for sellers only.", variant: "destructive" });
      } else if (role === "admin" && location.pathname.startsWith("/account")) {
        hasShownToast.current = true;
        toast({ title: "Access Denied", description: "Admins cannot access customer account pages.", variant: "destructive" });
      } else if (role === "seller" && !canAccessAccountPage(role, location.pathname)) {
        hasShownToast.current = true;
        toast({ title: "Permission Denied", description: "This section is for customers only.", variant: "destructive" });
      }
    }
  }, [isLoading, isAuthenticated, location.pathname, isSuperAdmin, role, toast]);

  useEffect(() => {
    hasShownToast.current = false;
  }, [location.pathname]);

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
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If on wrong production domain, show loading while redirect happens
  if (isProductionDomain() && actualRole && !isDomainAllowedForRole(actualRole) && !isImpersonating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-2xl font-bold text-primary tracking-tight mb-4">FANZON</div>
        <FanzonSpinner size="lg" />
        <p className="text-sm text-muted-foreground mt-4 animate-pulse">Redirecting to your dashboard...</p>
      </div>
    );
  }

  // When impersonating, skip all role checks - admin is already authenticated
  if (isImpersonating && isSuperAdmin) {
    return <>{children}</>;
  }

  // Super admin check for admin routes
  if (requireSuperAdmin || (allowedRoles?.includes("admin") && location.pathname.startsWith("/admin"))) {
    if (!isSuperAdmin) {
      console.warn(`Unauthorized admin access attempt by: ${user?.email} to ${location.pathname}`);
      return <Navigate to="/forbidden" replace />;
    }
  }

  // Role-based session locking
  if (actualRole === "seller" && !canAccessAccountPage(actualRole, location.pathname)) {
    return <Navigate to="/seller/dashboard" replace />;
  }
  if (actualRole === "admin" && !canAccessAccountPage(actualRole, location.pathname)) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (actualRole === "support_agent" && !canAccessAccountPage(actualRole, location.pathname)) {
    return <Navigate to="/agent/dashboard" replace />;
  }

  // Role requirement check
  if (allowedRoles && allowedRoles.length > 0) {
    if (allowedRoles.includes("admin") && !isSuperAdmin) {
      return <Navigate to="/forbidden" replace />;
    }
    if (!actualRole || !allowedRoles.includes(actualRole)) {
      const redirectPath = getRoleRedirectPath(actualRole);
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
