-- Add maintenance mode setting to admin_settings
INSERT INTO admin_settings (setting_key, setting_value, description)
VALUES ('maintenance_mode', 'false', 'When enabled, all non-admin users are redirected to maintenance page')
ON CONFLICT (setting_key) DO NOTHING;