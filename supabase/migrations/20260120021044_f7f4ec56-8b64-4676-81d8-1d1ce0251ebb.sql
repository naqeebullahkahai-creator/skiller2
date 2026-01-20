-- Create a security definer function to check if a user is the super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = _user_id
      AND email = 'alxteam001@gmail.com'
  )
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;

-- Update payout_requests table policies for super admin only access
DROP POLICY IF EXISTS "Admins can view all payout requests" ON public.payout_requests;
DROP POLICY IF EXISTS "Admins can update payout requests" ON public.payout_requests;

CREATE POLICY "Super admin can view all payout requests"
ON public.payout_requests FOR SELECT
USING (
  public.is_super_admin(auth.uid())
  OR seller_id = auth.uid()
);

CREATE POLICY "Super admin can update payout requests"
ON public.payout_requests FOR UPDATE
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin can delete payout requests"
ON public.payout_requests FOR DELETE
USING (public.is_super_admin(auth.uid()));

-- Update seller_profiles policies for super admin
DROP POLICY IF EXISTS "Admins can view all seller profiles" ON public.seller_profiles;
DROP POLICY IF EXISTS "Admins can update seller profiles" ON public.seller_profiles;

CREATE POLICY "Super admin can view all seller profiles"
ON public.seller_profiles FOR SELECT
USING (
  public.is_super_admin(auth.uid())
  OR user_id = auth.uid()
);

CREATE POLICY "Super admin can update any seller profile"
ON public.seller_profiles FOR UPDATE
USING (
  public.is_super_admin(auth.uid())
  OR user_id = auth.uid()
);

-- Update admin_settings policies for super admin only
DROP POLICY IF EXISTS "Only admins can view settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Only admins can update settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Only admins can insert settings" ON public.admin_settings;

CREATE POLICY "Super admin can view settings"
ON public.admin_settings FOR SELECT
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin can update settings"
ON public.admin_settings FOR UPDATE
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin can insert settings"
ON public.admin_settings FOR INSERT
WITH CHECK (public.is_super_admin(auth.uid()));

-- Update financial_logs policies for super admin only
DROP POLICY IF EXISTS "Admins can view all financial logs" ON public.financial_logs;

CREATE POLICY "Super admin can view all financial logs"
ON public.financial_logs FOR SELECT
USING (
  public.is_super_admin(auth.uid())
  OR seller_id = auth.uid()
  OR customer_id = auth.uid()
);

-- Update user_roles policies for super admin management
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;

CREATE POLICY "Super admin can view all roles"
ON public.user_roles FOR SELECT
USING (
  public.is_super_admin(auth.uid())
  OR user_id = auth.uid()
);

CREATE POLICY "Super admin can update roles"
ON public.user_roles FOR UPDATE
USING (public.is_super_admin(auth.uid()));

-- Update wallet_transactions policies
DROP POLICY IF EXISTS "Sellers can view their own transactions" ON public.wallet_transactions;

CREATE POLICY "View wallet transactions"
ON public.wallet_transactions FOR SELECT
USING (
  public.is_super_admin(auth.uid())
  OR seller_id = auth.uid()
);

-- Update seller_wallets policies
DROP POLICY IF EXISTS "Sellers can view their own wallet" ON public.seller_wallets;

CREATE POLICY "View seller wallets"
ON public.seller_wallets FOR SELECT
USING (
  public.is_super_admin(auth.uid())
  OR seller_id = auth.uid()
);