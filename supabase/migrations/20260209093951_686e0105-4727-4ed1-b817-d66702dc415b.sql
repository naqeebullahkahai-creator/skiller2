
-- Insert new admin settings for new seller grace period policy
INSERT INTO admin_settings (setting_key, setting_value, description)
VALUES 
  ('new_seller_grace_enabled', 'true', 'Enable automatic grace period for newly verified sellers'),
  ('new_seller_grace_months', '3', 'Number of months for new seller grace period'),
  ('new_seller_grace_commission', '0', 'Commission percentage during new seller grace period')
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger function to auto-assign grace period on seller verification
CREATE OR REPLACE FUNCTION public.auto_assign_grace_period()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_grace_enabled BOOLEAN;
  v_grace_months INT;
  v_grace_commission NUMERIC;
BEGIN
  -- Only fire when verification_status changes to 'verified'
  IF NEW.verification_status = 'verified' AND (OLD.verification_status IS DISTINCT FROM 'verified') THEN
    -- Check if grace period is enabled
    SELECT (setting_value = 'true') INTO v_grace_enabled
    FROM admin_settings WHERE setting_key = 'new_seller_grace_enabled';

    IF COALESCE(v_grace_enabled, false) THEN
      -- Get grace period settings
      SELECT COALESCE(CAST(setting_value AS INT), 3) INTO v_grace_months
      FROM admin_settings WHERE setting_key = 'new_seller_grace_months';

      SELECT COALESCE(CAST(setting_value AS NUMERIC), 0) INTO v_grace_commission
      FROM admin_settings WHERE setting_key = 'new_seller_grace_commission';

      -- Create or update seller_commissions entry
      INSERT INTO seller_commissions (seller_id, grace_period_months, grace_start_date, grace_commission_percentage, notes)
      VALUES (NEW.user_id, v_grace_months, now(), v_grace_commission, 'Auto-assigned grace period on verification')
      ON CONFLICT (seller_id) DO UPDATE SET
        grace_period_months = v_grace_months,
        grace_start_date = now(),
        grace_commission_percentage = v_grace_commission,
        notes = COALESCE(seller_commissions.notes, '') || ' | Auto grace period reassigned on re-verification',
        updated_at = now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create the trigger on seller_profiles
DROP TRIGGER IF EXISTS trigger_auto_assign_grace_period ON seller_profiles;
CREATE TRIGGER trigger_auto_assign_grace_period
  BEFORE UPDATE ON seller_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_grace_period();

-- Add unique constraint on seller_commissions.seller_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'seller_commissions_seller_id_key'
  ) THEN
    ALTER TABLE seller_commissions ADD CONSTRAINT seller_commissions_seller_id_key UNIQUE (seller_id);
  END IF;
END $$;
