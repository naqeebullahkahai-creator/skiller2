-- Add fee_per_product to flash_sales for session-based pricing
ALTER TABLE public.flash_sales 
ADD COLUMN IF NOT EXISTS fee_per_product_pkr NUMERIC NOT NULL DEFAULT 10,
ADD COLUMN IF NOT EXISTS application_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';

-- Add fee tracking to flash_sale_nominations
ALTER TABLE public.flash_sale_nominations
ADD COLUMN IF NOT EXISTS total_fee_pkr NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS fee_deducted BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS fee_deducted_at TIMESTAMP WITH TIME ZONE;

-- Create function to deduct flash sale fee from seller wallet
CREATE OR REPLACE FUNCTION public.deduct_flash_sale_fee(
  p_nomination_id UUID,
  p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nomination RECORD;
  v_wallet_id UUID;
  v_current_balance NUMERIC;
BEGIN
  -- Get nomination details
  SELECT * INTO v_nomination FROM flash_sale_nominations WHERE id = p_nomination_id;
  
  IF v_nomination IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Nomination not found');
  END IF;
  
  IF v_nomination.fee_deducted THEN
    RETURN jsonb_build_object('success', false, 'message', 'Fee already deducted');
  END IF;
  
  -- Get seller wallet
  SELECT id, current_balance INTO v_wallet_id, v_current_balance 
  FROM seller_wallets WHERE seller_id = v_nomination.seller_id;
  
  IF v_wallet_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Seller wallet not found');
  END IF;
  
  IF v_current_balance < v_nomination.total_fee_pkr THEN
    RETURN jsonb_build_object('success', false, 'message', 'Insufficient wallet balance');
  END IF;
  
  -- Deduct from wallet
  INSERT INTO wallet_transactions (
    wallet_id, seller_id, transaction_type,
    gross_amount, net_amount, description
  ) VALUES (
    v_wallet_id, v_nomination.seller_id, 'flash_sale_fee',
    v_nomination.total_fee_pkr, -v_nomination.total_fee_pkr,
    'Flash Sale participation fee'
  );
  
  UPDATE seller_wallets
  SET current_balance = current_balance - v_nomination.total_fee_pkr,
      updated_at = now()
  WHERE id = v_wallet_id;
  
  -- Mark fee as deducted
  UPDATE flash_sale_nominations
  SET fee_deducted = true,
      fee_deducted_at = now(),
      status = 'approved',
      updated_at = now()
  WHERE id = p_nomination_id;
  
  -- Notify seller
  INSERT INTO notifications (user_id, title, message, notification_type, link)
  VALUES (
    v_nomination.seller_id,
    'Flash Sale Application Approved! 🎉',
    'Your product has been approved for the flash sale. Rs. ' || v_nomination.total_fee_pkr || ' has been deducted from your wallet.',
    'promotion',
    '/seller-center/flash-sales'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Fee deducted successfully',
    'amount_deducted', v_nomination.total_fee_pkr
  );
END;
$$;

-- Create function to notify all sellers about new flash sale
CREATE OR REPLACE FUNCTION public.notify_sellers_flash_sale(p_flash_sale_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_flash_sale RECORD;
  v_seller RECORD;
  v_count INTEGER := 0;
BEGIN
  -- Get flash sale details
  SELECT * INTO v_flash_sale FROM flash_sales WHERE id = p_flash_sale_id;
  
  IF v_flash_sale IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Notify all verified sellers
  FOR v_seller IN 
    SELECT sp.user_id 
    FROM seller_profiles sp 
    WHERE sp.verification_status = 'verified'
  LOOP
    INSERT INTO notifications (user_id, title, message, notification_type, link)
    VALUES (
      v_seller.user_id,
      '🔥 New Flash Sale Opportunity!',
      'A new flash sale "' || v_flash_sale.campaign_name || '" is accepting applications. Apply now to feature your products!',
      'promotion',
      '/seller-center/flash-sales'
    );
    v_count := v_count + 1;
  END LOOP;
  
  -- Update flash sale status to active
  UPDATE flash_sales SET status = 'accepting_applications' WHERE id = p_flash_sale_id;
  
  RETURN v_count;
END;
$$;

-- Insert default flash sale fee setting
INSERT INTO admin_settings (setting_key, setting_value, description)
VALUES ('flash_sale_fee_per_product', '10', 'Fee in PKR charged per product for flash sale participation')
ON CONFLICT (setting_key) DO NOTHING;