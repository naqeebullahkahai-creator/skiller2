/**
 * Domain-based routing configuration.
 * Detects which role/interface should be rendered based on the current hostname.
 */

export type DomainRole = 'main' | 'admin' | 'seller' | 'customer' | 'agent';

type RoleSlug = 'admin' | 'seller' | 'customer' | 'agent' | 'main';
type DomainStyle = 'hyphen' | 'dot';

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase();
}

interface Parsed2bdDomain {
  baseLabel: string;
  roleSlug: RoleSlug;
  style: DomainStyle;
}

/**
 * Supported patterns:
 * - Main: fanzon.2bd.net
 * - Role (hyphen): admin-fanzon.2bd.net
 * - Role (dot): admin.fanzon.2bd.net
 */
function parse2bdDomain(hostname: string): Parsed2bdDomain | null {
  const host = normalizeHostname(hostname);

  const hyphenRoleMatch = host.match(/^(admin|seller|customer|agent)-([a-z0-9-]+)\.2bd\.net$/i);
  if (hyphenRoleMatch) {
    return {
      roleSlug: hyphenRoleMatch[1].toLowerCase() as RoleSlug,
      baseLabel: hyphenRoleMatch[2].toLowerCase(),
      style: 'hyphen',
    };
  }

  const dotRoleMatch = host.match(/^(admin|seller|customer|agent)\.([a-z0-9-]+)\.2bd\.net$/i);
  if (dotRoleMatch) {
    return {
      roleSlug: dotRoleMatch[1].toLowerCase() as RoleSlug,
      baseLabel: dotRoleMatch[2].toLowerCase(),
      style: 'dot',
    };
  }

  const mainMatch = host.match(/^([a-z0-9-]+)\.2bd\.net$/i);
  if (mainMatch) {
    return {
      baseLabel: mainMatch[1].toLowerCase(),
      roleSlug: 'main',
      style: 'hyphen',
    };
  }

  return null;
}

function roleSlugToDomainRole(roleSlug: RoleSlug): DomainRole {
  switch (roleSlug) {
    case 'admin':
      return 'admin';
    case 'seller':
      return 'seller';
    case 'customer':
      return 'customer';
    case 'agent':
      return 'agent';
    case 'main':
    default:
      return 'main';
  }
}

function build2bdDomainForRole(baseLabel: string, role: DomainRole, style: DomainStyle): string {
  const cleanBase = baseLabel.toLowerCase();
  if (role === 'main') return `${cleanBase}.2bd.net`;
  return style === 'dot' ? `${role}.${cleanBase}.2bd.net` : `${role}-${cleanBase}.2bd.net`;
}

/**
 * Detect the current domain role based on window.location.hostname.
 * Falls back to 'main' for localhost, preview URLs, and non-2bd domains.
 */
export function getDomainRole(): DomainRole {
  if (typeof window === 'undefined') return 'main';

  const hostname = normalizeHostname(window.location.hostname);
  const parsed = parse2bdDomain(hostname);
  if (!parsed) return 'main';

  return roleSlugToDomainRole(parsed.roleSlug);
}

/**
 * Get the default redirect path for a domain role.
 */
export function getDefaultPathForRole(role: DomainRole): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'seller':
      return '/seller/dashboard';
    case 'customer':
      return '/account';
    case 'agent':
      return '/agent/dashboard';
    case 'main':
    default:
      return '/';
  }
}

/**
 * Check if we're on a production domain (*.2bd.net).
 */
export function isProductionDomain(): boolean {
  if (typeof window === 'undefined') return false;
  return normalizeHostname(window.location.hostname).endsWith('.2bd.net');
}

/**
 * Get the role-specific subdomain URL for cross-domain redirect after login.
 * Returns null if we're on localhost/preview (no cross-domain redirect needed)
 * or if the user is already on the correct domain.
 */
export function getCrossDomainRedirectUrl(userRole: string): string | null {
  if (!isProductionDomain()) return null;
  if (typeof window === 'undefined') return null;

  const hostname = normalizeHostname(window.location.hostname);
  const parsed = parse2bdDomain(hostname);
  if (!parsed) return null;

  const roleToDomainRole: Record<string, DomainRole> = {
    admin: 'admin',
    seller: 'seller',
    customer: 'customer',
    support_agent: 'agent',
  };

  const targetDomainRole = roleToDomainRole[userRole];
  if (!targetDomainRole) return null;

  const currentDomainRole = roleSlugToDomainRole(parsed.roleSlug);

  if (currentDomainRole === targetDomainRole) return null;

  // Customer on main domain is fine
  if (userRole === 'customer' && currentDomainRole === 'main') return null;

  const targetHost = build2bdDomainForRole(parsed.baseLabel, targetDomainRole, parsed.style);
  const defaultPath = getDefaultPathForRole(targetDomainRole);

  return `https://${targetHost}${defaultPath}`;
}

/**
 * Get the in-app redirect path for a user role (used when already on correct domain or localhost).
 */
export function getInAppRedirectPath(userRole: string): string {
  switch (userRole) {
    case 'admin':
      return '/admin/dashboard';
    case 'seller':
      return '/seller/dashboard';
    case 'support_agent':
      return '/agent/dashboard';
    case 'customer':
    default:
      return '/';
  }
}

