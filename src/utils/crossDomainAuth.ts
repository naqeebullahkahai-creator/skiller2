/**
 * Cross-domain authentication utilities.
 * 
 * Since each subdomain (fanzon.2bd.net, admin-fanzon.2bd.net, etc.) has its own
 * localStorage, we pass Supabase auth tokens via URL hash fragments when redirecting
 * between domains. The receiving domain picks them up and calls setSession().
 */

import { supabase } from "@/integrations/supabase/client";

const TOKEN_HASH_PREFIX = "#sso_";

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
