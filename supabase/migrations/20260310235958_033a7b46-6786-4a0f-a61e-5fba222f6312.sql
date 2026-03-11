-- Fix 1: Make free_months default to 1 so un-reject doesn't fail
ALTER TABLE public.seller_subscriptions ALTER COLUMN free_months SET DEFAULT 1;

-- Fix 2: Add agent_wallet_transactions table for agent wallet history
CREATE TABLE IF NOT EXISTS public.agent_wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL DEFAULT 'salary',
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents view own wallet transactions"
ON public.agent_wallet_transactions FOR SELECT
TO authenticated
USING (agent_id = auth.uid());

CREATE POLICY "Admins view all agent wallet transactions"
ON public.agent_wallet_transactions FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "System insert agent wallet transactions"
ON public.agent_wallet_transactions FOR INSERT
TO authenticated
WITH CHECK (true);

-- Function to process agent salary payment (credit wallet)
CREATE OR REPLACE FUNCTION public.process_agent_salary(p_salary_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_salary RECORD;
  v_wallet RECORD;
  v_next timestamptz;
BEGIN
  SELECT * INTO v_salary FROM agent_salaries WHERE id = p_salary_id AND is_active = true;
  IF v_salary IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Salary not found or inactive');
  END IF;

  SELECT * INTO v_wallet FROM agent_wallets WHERE agent_id = v_salary.agent_id;
  IF v_wallet IS NULL THEN
    INSERT INTO agent_wallets (agent_id, balance, total_earned, total_withdrawn)
    VALUES (v_salary.agent_id, 0, 0, 0)
    RETURNING * INTO v_wallet;
  END IF;

  UPDATE agent_wallets SET
    balance = balance + v_salary.amount,
    total_earned = total_earned + v_salary.amount,
    updated_at = now()
  WHERE id = v_wallet.id;

  INSERT INTO agent_wallet_transactions (agent_id, amount, transaction_type, description, reference_id)
  VALUES (v_salary.agent_id, v_salary.amount, 'salary', v_salary.frequency || ' salary payment Rs.' || v_salary.amount, p_salary_id::text);

  v_next := CASE v_salary.frequency
    WHEN 'weekly' THEN now() + INTERVAL '7 days'
    WHEN 'biweekly' THEN now() + INTERVAL '14 days'
    ELSE now() + INTERVAL '30 days'
  END;

  UPDATE agent_salaries SET
    last_paid_at = now(),
    next_payment_at = v_next,
    updated_at = now()
  WHERE id = p_salary_id;

  INSERT INTO notifications (user_id, title, message, notification_type, link)
  VALUES (v_salary.agent_id, '💰 Salary Received!', 'Rs. ' || v_salary.amount || ' has been credited to your wallet.', 'system', '/agent/earnings');

  RETURN jsonb_build_object('success', true, 'amount', v_salary.amount, 'next_payment', v_next);
END;
$$;

-- Function to request agent withdrawal
CREATE OR REPLACE FUNCTION public.request_agent_withdrawal(p_agent_id uuid, p_amount numeric)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_wallet RECORD;
BEGIN
  SELECT * INTO v_wallet FROM agent_wallets WHERE agent_id = p_agent_id;
  IF v_wallet IS NULL OR v_wallet.balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'message', 'Insufficient balance');
  END IF;

  UPDATE agent_wallets SET
    balance = balance - p_amount,
    total_withdrawn = total_withdrawn + p_amount,
    updated_at = now()
  WHERE agent_id = p_agent_id;

  INSERT INTO agent_wallet_transactions (agent_id, amount, transaction_type, description)
  VALUES (p_agent_id, -p_amount, 'withdrawal', 'Withdrawal request Rs.' || p_amount);

  INSERT INTO agent_payouts (agent_id, amount, status)
  VALUES (p_agent_id, p_amount, 'pending');

  RETURN jsonb_build_object('success', true, 'message', 'Withdrawal requested');
END;
$$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_wallet_transactions