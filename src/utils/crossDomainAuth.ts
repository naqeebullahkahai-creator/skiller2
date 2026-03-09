/**
 * Cross-domain authentication utilities.
 * 
 * Since each subdomain (fanzon.2bd.net, admin-fanzon.2bd.net, etc.) has its own
 * localStorage, we pass Supabase auth tokens via URL hash fragments when redirecting
 * between domains. The receiving domain picks them up and calls setSession().
 */

import { supabase } from "@/integrations/supabase/client";

const TOKEN_HASH_PREFIX = "#sso_";
const LOGOUT_HASH = "#sso_logout";

/**
 * Build a cross-domain URL that includes the current session tokens
 * so the target domain can restore the session.
 */
export async function buildCrossDomainUrl(targetUrl: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token || !session?.refresh_token) {
    return targetUrl;
  }

  const params = new URLSearchParams({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  // Use hash fragment so tokens aren't sent to server
  const url = new URL(targetUrl);
  url.hash = TOKEN_HASH_PREFIX + params.toString();
  return url.toString();
}

/**
 * Check if the current URL has SSO tokens in the hash and restore the session.
 * Returns true if tokens were found and session was set.
 */
export async function receiveSessionFromUrl(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const hash = window.location.hash;

  // Handle logout signal
  if (hash === LOGOUT_HASH) {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    await supabase.auth.signOut();
    return false;
  }

  if (!hash.startsWith(TOKEN_HASH_PREFIX)) return false;

  const paramString = hash.slice(TOKEN_HASH_PREFIX.length);
  const params = new URLSearchParams(paramString);
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");

  if (!access_token || !refresh_token) return false;

  // Clean the hash immediately to avoid token leakage in history/bookmarks
  window.history.replaceState(null, "", window.location.pathname + window.location.search);

  try {
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    
    if (error) {
      console.error("Cross-domain session restore failed:", error.message);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error("Cross-domain session restore error:", e);
    return false;
  }
}

/**
 * Get the base label from the current hostname (e.g. "fanzon" from "admin-fanzon.2bd.net").
 */
function getBaseLabel(): string | null {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname.toLowerCase();
  
  // role-prefix hyphen style
  const hyphen = host.match(/^(?:admin|seller|customer|agent)-([a-z0-9-]+)\.2bd\.net$/);
  if (hyphen) return hyphen[1];
  
  // role-prefix dot style
  const dot = host.match(/^(?:admin|seller|customer|agent)\.([a-z0-9-]+)\.2bd\.net$/);
  if (dot) return dot[1];
  
  // main domain
  const main = host.match(/^([a-z0-9-]+)\.2bd\.net$/);
  if (main) return main[1];
  
  return null;
}

/**
 * Get all sibling domain origins for cross-domain logout.
 * Returns the other subdomain origins (not the current one).
 */
export function getSiblingDomainOrigins(): string[] {
  const base = getBaseLabel();
  if (!base) return [];

  const currentHost = window.location.hostname.toLowerCase();
  const allHosts = [
    `${base}.2bd.net`,           // main
    `admin-${base}.2bd.net`,     // admin
    `seller-${base}.2bd.net`,    // seller
    `customer-${base}.2bd.net`,  // customer  
    `agent-${base}.2bd.net`,     // agent
  ];

  return allHosts
    .filter((h) => h !== currentHost)
    .map((h) => `https://${h}`);
}

/**
 * Perform cross-domain logout by:
 * 1. Signing out locally
 * 2. Loading hidden iframes on sibling domains with logout signal
 */
export async function crossDomainLogout(): Promise<void> {
  const siblings = getSiblingDomainOrigins();

  // Sign out locally first
  await supabase.auth.signOut();

  // Fire-and-forget iframe logout on sibling domains
  siblings.forEach((origin) => {
    try {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = `${origin}/${LOGOUT_HASH}`;
      document.body.appendChild(iframe);
      // Clean up after 5 seconds
      setTimeout(() => {
        try { document.body.removeChild(iframe); } catch (_) {}
      }, 5000);
    } catch (_) {
      // Silently ignore if iframe fails
    }
  });
}
