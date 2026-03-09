/**
 * Domain-based routing configuration.
 * Maps hostnames to the role/interface that should be rendered.
 */

export type DomainRole = 'main' | 'admin' | 'seller' | 'customer' | 'agent';

const DOMAIN_MAP: Record<string, DomainRole> = {
  'admin-fanzon.2bd.net': 'admin',
  'seller-fanzon.2bd.net': 'seller',
  'customer-fanzon.2bd.net': 'customer',
  'agent-fanzon.2bd.net': 'agent',
  'fanzon.2bd.net': 'main',
};

/**
 * Detect the current domain role based on window.location.hostname.
 * Falls back to 'main' for localhost, preview URLs, and the primary lovable domain.
 */
export function getDomainRole(): DomainRole {
  if (typeof window === 'undefined') return 'main';
  
  const hostname = window.location.hostname;
  
  // Check exact match first
  if (DOMAIN_MAP[hostname]) {
    return DOMAIN_MAP[hostname];
  }
  
  // Fallback: localhost, preview, lovable.app → main (all routes)
  return 'main';
}

/**
 * Get the default redirect path for a domain role.
 */
export function getDefaultPathForRole(role: DomainRole): string {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'seller': return '/seller/dashboard';
    case 'customer': return '/account';
    case 'agent': return '/agent/dashboard';
    case 'main':
    default: return '/';
  }
}
