/**
 * Cross-domain authentication utilities.
 * 
 * Each subdomain (fanzon.2bd.net, admin-fanzon.2bd.net, etc.) has its own
 * localStorage. We pass Supabase auth tokens via URL hash fragments when
 * redirecting between domains, then setSession() on the receiving end.
 */

import { supabase } from "@/integrations/supabase/client";

const TOKEN_HASH_PREFIX = "#sso_";
const LOGOUT_HASH = "#sso_logout";

/**
 * Build a cross-domain URL that includes the current session tokens.
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

  const url = new URL(targetUrl);
  url.hash = TOKEN_HASH_PREFIX + params.toString();
  return url.toString();
}

/**
 * Check URL for SSO tokens and restore the session.
 * Returns true if session was successfully set.
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

  // Clean the hash immediately
  window.history.replaceState(null, "", window.location.pathname + window.location.search);

  try {
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) {
      console.error("[SSO] Session restore failed:", error.message);
      return false;
    }
    console.log("[SSO] Session restored successfully");
    return true;
  } catch (e) {
    console.error("[SSO] Session restore error:", e);
    return false;
  }
}

/**
 * Get base label from hostname (e.g. "fanzon" from "admin-fanzon.2bd.net").
 */
function getBaseLabel(): string | null {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname.toLowerCase();

  const hyphen = host.match(/^(?:admin|seller|customer|agent)-([a-z0-9-]+)\.2bd\.net$/);
  if (hyphen) return hyphen[1];

  const dot = host.match(/^(?:admin|seller|customer|agent)\.([a-z0-9-]+)\.2bd\.net$/);
  if (dot) return dot[1];

  const main = host.match(/^([a-z0-9-]+)\.2bd\.net$/);
  if (main) return main[1];

  return null;
}

/**
 * Get sibling domain origins for cross-domain logout.
 */
export function getSiblingDomainOrigins(): string[] {
  const base = getBaseLabel();
  if (!base) return [];

  const currentHost = window.location.hostname.toLowerCase();
  const allHosts = [
    `${base}.2bd.net`,
    `admin-${base}.2bd.net`,
    `seller-${base}.2bd.net`,
    `customer-${base}.2bd.net`,
    `agent-${base}.2bd.net`,
  ];

  return allHosts
    .filter((h) => h !== currentHost)
    .map((h) => `https://${h}`);
}

/**
 * Cross-domain logout: sign out locally + fire hidden iframes on siblings.
 */
export async function crossDomainLogout(): Promise<void> {
  const siblings = getSiblingDomainOrigins();

  await supabase.auth.signOut();

  siblings.forEach((origin) => {
    try {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = `${origin}/${LOGOUT_HASH}`;
      document.body.appendChild(iframe);
      setTimeout(() => {
        try { document.body.removeChild(iframe); } catch (_) {}
      }, 5000);
    } catch (_) {
      // Silently ignore
    }
  });
}
