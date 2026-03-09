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
 * Reverse map: role → subdomain URL
 */
const ROLE_DOMAIN_MAP: Record<string, string> = {
  'admin': 'https://admin-fanzon.2bd.net',
  'seller': 'https://seller-fanzon.2bd.net',
  'customer': 'https://customer-fanzon.2bd.net',
  'support_agent': 'https://agent-fanzon.2bd.net',
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

/**
 * Check if we're on a production domain (*.2bd.net).
 */
export function isProductionDomain(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.endsWith('.2bd.net');
}

/**
 * Get the role-specific subdomain URL for cross-domain redirect after login.
 * Returns null if we're on localhost/preview (no cross-domain redirect needed)
 * or if the user is already on the correct domain.
 */
export function getCrossDomainRedirectUrl(userRole: string): string | null {
  if (!isProductionDomain()) return null;
  
  const currentDomainRole = getDomainRole();
  
  // Map user roles to domain roles for comparison
  const roleToDomainRole: Record<string, DomainRole> = {
    'admin': 'admin',
    'seller': 'seller',
    'customer': 'customer',
    'support_agent': 'agent',
  };
  
  const targetDomainRole = roleToDomainRole[userRole];
  
  // Already on the correct domain
  if (currentDomainRole === targetDomainRole) return null;
  
  // Customer on main domain is fine
  if (userRole === 'customer' && currentDomainRole === 'main') return null;
  
  // Get target subdomain URL
  const targetBaseUrl = ROLE_DOMAIN_MAP[userRole];
  if (!targetBaseUrl) return null;
  
  // Get default path for the target role
  const defaultPath = getDefaultPathForRole(targetDomainRole || 'main');
  
  return `${targetBaseUrl}${defaultPath}`;
}

/**
 * Get the in-app redirect path for a user role (used when already on correct domain or localhost).
 */
export function getInAppRedirectPath(userRole: string): string {
  switch (userRole) {
    case 'admin': return '/admin/dashboard';
    case 'seller': return '/seller/dashboard';
    case 'support_agent': return '/agent/dashboard';
    case 'customer':
    default: return '/';
  }
}
