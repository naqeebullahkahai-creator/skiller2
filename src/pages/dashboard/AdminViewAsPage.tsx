import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FanzonSpinner } from "@/components/ui/fanzon-spinner";
import { supabase } from "@/integrations/supabase/client";
import { buildCrossDomainUrl } from "@/utils/crossDomainAuth";
import { isProductionDomain } from "@/utils/domainRouting";

/**
 * Builds the target domain URL for impersonation based on user role.
 * On production, redirects to the correct role subdomain.
 * On localhost/preview, redirects to in-app paths.
 */
function getImpersonationTarget(role: string): { url: string; isExternal: boolean } {
  if (isProductionDomain()) {
    // Extract base label from current hostname
    const host = window.location.hostname.toLowerCase();
    const hyphen = host.match(/^(?:admin|seller|customer|agent)-([a-z0-9-]+)\.2bd\.net$/);
    const dot = host.match(/^(?:admin|seller|customer|agent)\.([a-z0-9-]+)\.2bd\.net$/);
    const main = host.match(/^([a-z0-9-]+)\.2bd\.net$/);
    const baseLabel = hyphen?.[1] || dot?.[1] || main?.[1] || "fanzon";

    switch (role) {
      case "seller":
        return { url: `https://seller-${baseLabel}.2bd.net/seller/dashboard`, isExternal: true };
      case "support_agent":
        return { url: `https://agent-${baseLabel}.2bd.net/agent/dashboard`, isExternal: true };
      case "customer":
      default:
        return { url: `https://customer-${baseLabel}.2bd.net/account/profile`, isExternal: true };
    }
  }

  // Localhost / preview - just navigate in-app
  switch (role) {
    case "seller":
      return { url: "/seller/dashboard", isExternal: false };
    case "support_agent":
      return { url: "/agent/dashboard", isExternal: false };
    case "customer":
    default:
      return { url: "/account/profile", isExternal: false };
  }
}

const AdminViewAsPage = () => {
  const { userId } = useParams();
  const { isSuperAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (isLoading || !userId || hasStarted.current) return;

    if (!isSuperAdmin) {
      navigate("/forbidden", { replace: true });
      return;
    }

    hasStarted.current = true;

    // Fetch user role, then redirect to their domain
    (async () => {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      const role = roleData?.role || "customer";
      const { url, isExternal } = getImpersonationTarget(role);

      if (isExternal) {
        // Build SSO URL with tokens and open in new tab
        const ssoUrl = await buildCrossDomainUrl(url);
        window.location.replace(ssoUrl);
      } else {
        // On localhost, use impersonation context
        const { startImpersonation } = await import("@/contexts/ImpersonationContext").then(m => {
          // Can't use hook here, fall back to navigate
          return { startImpersonation: null };
        });
        navigate(url, { replace: true });
      }
    })().catch(() => {
      navigate("/admin/users", { replace: true });
    });
  }, [userId, isSuperAdmin, isLoading]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-2xl font-bold text-primary tracking-tight mb-4">FANZON</div>
      <FanzonSpinner size="lg" />
      <p className="text-sm text-muted-foreground mt-4 animate-pulse">Opening user dashboard...</p>
    </div>
  );
};

export default AdminViewAsPage;
