import { useEffect, useRef } from "react";
import { receiveSessionFromUrl } from "@/utils/crossDomainAuth";

/**
 * Placed near the top of the app tree. On mount, checks for SSO tokens
 * in the URL hash and restores the Supabase session if found.
 * This enables single sign-on across subdomains.
 */
const CrossDomainSessionReceiver = () => {
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;

    receiveSessionFromUrl();
  }, []);

  return null;
};

export default CrossDomainSessionReceiver;
