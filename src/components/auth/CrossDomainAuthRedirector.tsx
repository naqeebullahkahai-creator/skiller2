import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCrossDomainRedirectUrl, getDomainRole, isProductionDomain } from "@/utils/domainRouting";
import { buildCrossDomainUrl } from "@/utils/crossDomainAuth";

/**
 * Ensures users end up on the correct role subdomain after authentication.
 * 
 * Key fix: Only marks "redirected" AFTER we actually initiate a redirect.
 * This prevents the race condition where role loads after the first effect run.
 */
const CrossDomainAuthRedirector = () => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const redirectedForRole = useRef<string | null>(null);

  useEffect(() => {
    // Don't do anything while loading or already redirecting
    if (isLoading || isRedirecting) return;
    // Must be authenticated with a known role
    if (!isAuthenticated || !role) return;
    // Don't redirect again for the same role (prevents loops)
    if (redirectedForRole.current === role) return;
    // Only redirect on production domains
    if (!isProductionDomain()) return;

    const targetUrl = getCrossDomainRedirectUrl(role);
    
    if (!targetUrl) {
      // User is already on correct domain — mark as handled
      redirectedForRole.current = role;
      return;
    }

    // We need to redirect — lock and go
    setIsRedirecting(true);
    redirectedForRole.current = role;

    buildCrossDomainUrl(targetUrl).then((ssoUrl) => {
      console.log(`[SSO] Redirecting ${role} to ${targetUrl}`);
      window.location.replace(ssoUrl);
    }).catch((err) => {
      console.error("[SSO] Redirect failed:", err);
      setIsRedirecting(false);
      redirectedForRole.current = null;
    });
  }, [isAuthenticated, isLoading, role, isRedirecting]);

  return null;
};

export default CrossDomainAuthRedirector;
