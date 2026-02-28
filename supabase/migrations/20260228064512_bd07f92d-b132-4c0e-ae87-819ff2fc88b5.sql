
-- Add site_domain setting
INSERT INTO public.site_settings (setting_key, setting_value, is_enabled, setting_type, description)
VALUES ('site_domain', 'fanzon.pk', true, 'general', 'Primary domain used for QR codes, share links, and generated URLs')
ON CONFLICT (setting_key) DO NOTHING;
