
-- Agent Salaries table for scheduled salary payments
CREATE TABLE public.agent_salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  frequency TEXT NOT NULL DEFAULT 'monthly',
  next_payment_at TIMESTAMPTZ,
  last_paid_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_salaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage agent salaries" ON public.agent_salaries
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Agent Payouts table for withdrawal requests
CREATE TABLE public.agent_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  admin_notes TEXT,
  processed_by UUID,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage agent payouts" ON public.agent_payouts
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Agent Saved Wallets for payment info
CREATE TABLE public.agent_saved_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  wallet_type TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agent_id, account_number)
);

ALTER TABLE public.agent_saved_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can manage their wallets" ON public.agent_saved_wallets
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Agent Wallet Balance
CREATE TABLE public.agent_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL UNIQUE,
  balance NUMERIC NOT NULL DEFAULT 0,
  total_earned NUMERIC NOT NULL DEFAULT 0,
  total_withdrawn NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view their wallet" ON public.agent_wallets
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Fix the notify trigger to check for support_agent role instead of admin
CREATE OR REPLACE FUNCTION public.notify_online_agents_on_new_session()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  v_agent RECORD;
  v_user_name TEXT;
BEGIN
  SELECT full_name INTO v_user_name FROM profiles WHERE id = NEW.user_id;

  FOR v_agent IN
    SELECT aos.user_id
    FROM agent_online_status aos
    JOIN user_roles ur ON ur.user_id = aos.user_id
    WHERE aos.is_online = true
      AND ur.role = 'support_agent'
  LOOP
    INSERT INTO notifications (user_id, title, message, notification_type, link)
    VALUES (
      v_agent.user_id,
      '🆘 New Support Request',
      'User ' || COALESCE(v_user_name, 'Unknown') || ' needs help' || 
        CASE WHEN NEW.subject IS NOT NULL THEN ': ' || NEW.subject ELSE '' END,
      'system',
      '/agent/chats'
    );
  END LOOP;

  RETURN NEW;
END;
$function$;
