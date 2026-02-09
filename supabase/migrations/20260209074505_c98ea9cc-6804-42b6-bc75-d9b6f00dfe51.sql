-- Add PWA install prompt toggle setting
INSERT INTO site_settings (setting_key, setting_value, is_enabled, setting_type, description)
VALUES ('pwa_install_prompt', 'true', true, 'feature', 'Show PWA install prompt banner to mobile users')
ON CONFLICT (setting_key) DO NOTHING;