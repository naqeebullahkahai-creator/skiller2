/**
 * Domain-based routing configuration.
 * Detects which role/interface should be rendered based on the current hostname.
 * 
 * Supported domain patterns (2bd.net):
 *   Main:     fanzon.2bd.net
 *   Hyphen:   admin-fanzon.2bd.net
 *   Dot:      admin.fanzon.2bd.net
 */

export type DomainRole = 'main' | 'admin' | 'seller' | 'customer' | 'agent';

type RoleSlug = 'admin' | 'seller' | 'customer' | 'agent' | 'main';
type DomainStyle = 'hyphen' | 'dot';

const ROLE_PREFIXES = ['admin', 'seller', 'customer', 'agent'] as const;

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase();
}

interface Parsed2bdDomain {
  baseLabel: string;
  roleSlug: RoleSlug;
  style: DomainStyle;
}

/**
 * Parse a *.2bd.net hostname into its parts.
 */
function parse2bdDomain(hostname: string): Parsed2bdDomain | null {
  const host = normalizeHostname(hostname);

  // Hyphen style: admin-fanzon.2bd.net
  const hyphenMatch = host.match(/^(admin|seller|customer|agent)-([a-z0-9-]+)\.2bd\.net$/i);
  if (hyphenMatch) {
    return {
      roleSlug: hyphenMatch[1].toLowerCase() as RoleSlug,
      baseLabel: hyphenMatch[2].toLowerCase(),
      style: 'hyphen',
    };
  }

  // Dot style: admin.fanzon.2bd.net
  const dotMatch = host.match(/^(admin|seller|customer|agent)\.([a-z0-9-]+)\.2bd\.net$/i);
  if (dotMatch) {
    return {
      roleSlug: dotMatch[1].toLowerCase() as RoleSlug,
      baseLabel: dotMatch[2].toLowerCase(),
      style: 'dot',
    };
  }

  // Main domain: fanzon.2bd.net
  const mainMatch = host.match(/^([a-z0-9-]+)\.2bd\.net$/i);
  if (mainMatch) {
    return {
      baseLabel: mainMatch[1].toLowerCase(),
      roleSlug: 'main',
      style: 'hyphen', // default style for building sibling domains
    };
  }

  return null;
}

function roleSlugToDomainRole(roleSlug: RoleSlug): DomainRole {
  if (ROLE_PREFIXES.includes(roleSlug as any)) return roleSlug as DomainRole;
  return 'main';
}

function build2bdHost(baseLabel: string, role: DomainRole, style: DomainStyle): string {
  if (role === 'main') return `${baseLabel}.2bd.net`;
  return style === 'dot'
    ? `${role}.${baseLabel}.2bd.net`
    : `${role}-${baseLabel}.2bd.net`;
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Detect the current domain role. Falls back to 'main' for localhost / preview.
 */
export function getDomainRole(): DomainRole {
  if (typeof window === 'undefined') return 'main';
  const parsed = parse2bdDomain(window.location.hostname);
  return parsed ? roleSlugToDomainRole(parsed.roleSlug) : 'main';
}

/**
 * Default landing path for a domain role.
 */
export function getDefaultPathForRole(role: DomainRole): string {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'seller': return '/seller/dashboard';
    case 'customer': return '/account';
    case 'agent': return '/agent/dashboard';
    default: return '/';
  }
}

/**
 * Check if we're on a production *.2bd.net domain.
 */
export function isProductionDomain(): boolean {
  if (typeof window === 'undefined') return false;
  return normalizeHostname(window.location.hostname).endsWith('.2bd.net');
}

/**
 * Map a user role (from DB) to the expected DomainRole.
 */
function userRoleToDomainRole(userRole: string): DomainRole | null {
  switch (userRole) {
    case 'admin': return 'admin';
    case 'seller': return 'seller';
    case 'customer': return 'customer';
    case 'support_agent': return 'agent';
    default: return null;
  }
}

/**
 * Get the cross-domain redirect URL if the user is on the wrong domain.
 * Returns null if:
 *   - Not on production domain
 *   - Already on the correct domain
 *   - Customer on main domain (allowed)
 */
export function getCrossDomainRedirectUrl(userRole: string): string | null {
  if (!isProductionDomain() || typeof window === 'undefined') return null;

  const parsed = parse2bdDomain(window.location.hostname);
  if (!parsed) return null;

  const targetDomainRole = userRoleToDomainRole(userRole);
  if (!targetDomainRole) return null;

  const currentDomainRole = roleSlugToDomainRole(parsed.roleSlug);

  // Already on correct domain
  if (currentDomainRole === targetDomainRole) return null;

  // Customer on main domain is fine
  if (userRole === 'customer' && currentDomainRole === 'main') return null;

  // Build target URL
  const targetHost = build2bdHost(parsed.baseLabel, targetDomainRole, parsed.style);
  const defaultPath = getDefaultPathForRole(targetDomainRole);
  return `https://${targetHost}${defaultPath}`;
}

/**
 * In-app redirect path (used on correct domain or localhost).
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

/**
 * Check if the current domain allows the given user role.
 * Used by ProtectedRoute to avoid "Access Denied" on wrong domains.
 */
export function isDomainAllowedForRole(userRole: string): boolean {
  if (!isProductionDomain()) return true; // localhost/preview — allow all

  const currentDomainRole = getDomainRole();
  const expectedDomainRole = userRoleToDomainRole(userRole);

  if (!expectedDomainRole) return true;

  // Exact match
  if (currentDomainRole === expectedDomainRole) return true;

  // Customer on main domain is allowed
  if (userRole === 'customer' && currentDomainRole === 'main') return true;

  // Main domain allows anyone to see public pages (auth, products, etc.)
  // But role-specific dashboards are still guarded by ProtectedRoute
  if (currentDomainRole === 'main') return true;

  return false;
}
