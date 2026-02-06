-- Create enum for deposit request status
CREATE TYPE deposit_request_status AS ENUM ('pending', 'approved', 'rejected');

-- Create enum for deposit requester type
CREATE TYPE deposit_requester_type AS ENUM ('customer', 'seller');

-- Create payment_methods table for admin-managed payment options
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  method_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT,
  iban TEXT,
  till_id TEXT,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deposit_requests table
CREATE TABLE public.deposit_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  requester_type deposit_requester_type NOT NULL,
  payment_method_id UUID NOT NULL REFERENCES public.payment_methods(id) ON DELETE RESTRICT,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  screenshot_url TEXT NOT NULL,
  transaction_reference TEXT,
  status deposit_request_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add site setting for deposit feature toggle
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, is_enabled, description)
VALUES ('manual_deposits_enabled', 'true', 'boolean', true, 'Enable or disable the manual deposit feature for users and sellers')
ON CONFLICT (setting_key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;

-- Payment methods policies (public read for active methods, admin write)
CREATE POLICY "Anyone can view active payment methods"
ON public.payment_methods
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage payment methods"
ON public.payment_methods
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Deposit requests policies
CREATE POLICY "Users can view their own deposit requests"
ON public.deposit_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create deposit requests"
ON public.deposit_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all deposit requests"
ON public.deposit_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update deposit requests"
ON public.deposit_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create function to approve deposit and update wallet
CREATE OR REPLACE FUNCTION public.approve_deposit_request(
  p_deposit_id UUID,
  p_admin_id UUID,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_deposit RECORD;
  v_wallet_id UUID;
BEGIN
  -- Get deposit request
  SELECT * INTO v_deposit FROM deposit_requests WHERE id = p_deposit_id AND status = 'pending';
  
  IF v_deposit IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Deposit request not found or already processed');
  END IF;
  
  -- Process based on requester type
  IF v_deposit.requester_type = 'seller' THEN
    -- Get or create seller wallet
    SELECT id INTO v_wallet_id FROM seller_wallets WHERE seller_id = v_deposit.user_id;
    
    IF v_wallet_id IS NULL THEN
      INSERT INTO seller_wallets (seller_id) VALUES (v_deposit.user_id)
      RETURNING id INTO v_wallet_id;
    END IF;
    
    -- Add transaction
    INSERT INTO wallet_transactions (
      wallet_id, seller_id, transaction_type,
      gross_amount, net_amount, description
    ) VALUES (
      v_wallet_id, v_deposit.user_id, 'earning',
      v_deposit.amount, v_deposit.amount,
      'Manual deposit approved'
    );
    
    -- Update wallet balance
    UPDATE seller_wallets
    SET current_balance = current_balance + v_deposit.amount,
        total_earnings = total_earnings + v_deposit.amount,
        updated_at = now()
    WHERE id = v_wallet_id;
    
  ELSE
    -- Customer wallet
    SELECT id INTO v_wallet_id FROM customer_wallets WHERE customer_id = v_deposit.user_id;
    
    IF v_wallet_id IS NULL THEN
      INSERT INTO customer_wallets (customer_id, balance) VALUES (v_deposit.user_id, 0)
      RETURNING id INTO v_wallet_id;
    END IF;
    
    -- Add transaction
    INSERT INTO customer_wallet_transactions (
      wallet_id, customer_id, transaction_type,
      amount, description
    ) VALUES (
      v_wallet_id, v_deposit.user_id, 'deposit',
      v_deposit.amount, 'Manual deposit approved'
    );
    
    -- Update wallet balance
    UPDATE customer_wallets
    SET balance = balance + v_deposit.amount,
        updated_at = now()
    WHERE id = v_wallet_id;
  END IF;
  
  -- Update deposit request status
  UPDATE deposit_requests
  SET status = 'approved',
      admin_notes = p_admin_notes,
      processed_by = p_admin_id,
      processed_at = now(),
      updated_at = now()
  WHERE id = p_deposit_id;
  
  -- Create notification
  INSERT INTO notifications (user_id, title, message, notification_type, link)
  VALUES (
    v_deposit.user_id,
    '💰 Deposit Approved!',
    'Your deposit of Rs. ' || v_deposit.amount || ' has been approved and added to your wallet.',
    'system',
    CASE WHEN v_deposit.requester_type = 'seller' THEN '/seller/wallet' ELSE '/account/profile' END
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Deposit approved successfully', 'amount', v_deposit.amount);
END;
$$;

-- Create function to reject deposit
CREATE OR REPLACE FUNCTION public.reject_deposit_request(
  p_deposit_id UUID,
  p_admin_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_deposit RECORD;
BEGIN
  SELECT * INTO v_deposit FROM deposit_requests WHERE id = p_deposit_id AND status = 'pending';
  
  IF v_deposit IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Deposit request not found or already processed');
  END IF;
  
  -- Update deposit request status
  UPDATE deposit_requests
  SET status = 'rejected',
      admin_notes = p_reason,
      processed_by = p_admin_id,
      processed_at = now(),
      updated_at = now()
  WHERE id = p_deposit_id;
  
  -- Create notification
  INSERT INTO notifications (user_id, title, message, notification_type)
  VALUES (
    v_deposit.user_id,
    '❌ Deposit Rejected',
    'Your deposit request of Rs. ' || v_deposit.amount || ' was rejected. Reason: ' || p_reason,
    'system'
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Deposit rejected');
END;
$$;

-- Create storage bucket for deposit screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('deposit-screenshots', 'deposit-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for deposit screenshots
CREATE POLICY "Users can upload their own deposit screenshots"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'deposit-screenshots' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own deposit screenshots"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'deposit-screenshots' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all deposit screenshots"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'deposit-screenshots' AND
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_payment_methods_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deposit_requests_updated_at
BEFORE UPDATE ON public.deposit_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();