-- Create function to check if email exists with a specific role
CREATE OR REPLACE FUNCTION public.check_email_role_conflict(p_email TEXT, p_target_role app_role)
RETURNS TABLE(has_conflict BOOLEAN, existing_role app_role)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_existing_role app_role;
BEGIN
  -- Get user_id from auth.users by email
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = p_email;
  
  -- If no user exists, no conflict
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::app_role;
    RETURN;
  END IF;
  
  -- Check for existing role
  SELECT role INTO v_existing_role 
  FROM user_roles 
  WHERE user_id = v_user_id;
  
  -- If no role assigned, no conflict
  IF v_existing_role IS NULL THEN
    RETURN QUERY SELECT false, NULL::app_role;
    RETURN;
  END IF;
  
  -- Check if existing role conflicts with target role
  IF v_existing_role != p_target_role THEN
    RETURN QUERY SELECT true, v_existing_role;
  ELSE
    RETURN QUERY SELECT false, v_existing_role;
  END IF;
END;
$$;

-- Create function to get role name for display
CREATE OR REPLACE FUNCTION public.get_role_display_name(p_role app_role)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_role
    WHEN 'customer' THEN 'Customer'
    WHEN 'seller' THEN 'Business Partner'
    WHEN 'admin' THEN 'Administrator'
  END;
$$;