import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCrossDomainRedirectUrl } from "@/utils/domainRouting";

/**
 * Ensures users end up on the correct role subdomain after authentication.
 * - Runs only on production domains (handled inside getCrossDomainRedirectUrl)
 * - Uses location.replace to avoid back-navigation to the wrong domain
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
    window.location.replace(url);
  }, [isAuthenticated, isLoading, role]);

  return null;
};

export default CrossDomainAuthRedirector;
