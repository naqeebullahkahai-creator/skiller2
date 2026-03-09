import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCrossDomainRedirectUrl, getDomainRole, isProductionDomain } from "@/utils/domainRouting";
import { buildCrossDomainUrl } from "@/utils/crossDomainAuth";

/**
 * Ensures users end up on the correct role subdomain after authentication.
 * 
 * Two responsibilities:
 * 1. After login: redirect to the correct role subdomain with SSO tokens
 * 2. On wrong domain: redirect to correct domain (e.g. seller on admin domain)
 */
const CrossDomainAuthRedirector = () => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (hasRedirectedRef.current) return;
    if (isLoading) return;
    if (!isAuthenticated) return;
    if (!role) return;

    const url = getCrossDomainRedirectUrl(role);
    if (!url) return;

    hasRedirectedRef.current = true;

    // Build URL with SSO tokens and redirect
    buildCrossDomainUrl(url).then((ssoUrl) => {
      window.location.replace(ssoUrl);
    });
  }, [isAuthenticated, isLoading, role]);

  return null;
};

export default CrossDomainAuthRedirector;
