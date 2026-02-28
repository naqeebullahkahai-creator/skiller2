import { useSiteSettings } from '@/hooks/useSiteSettings';

export const useSiteDomain = () => {
  const { getSetting, isLoading } = useSiteSettings();

  const domainSetting = getSetting('site_domain');
  const domain = domainSetting?.setting_value || window.location.origin.replace(/^https?:\/\//, '');

  const buildUrl = (path: string) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `https://${domain}${cleanPath}`;
  };

  return { domain, buildUrl, isLoading };
};
