
-- Allow super admin to update user_roles for agent assignment
CREATE POLICY "Super admins can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Allow super admin to insert user_roles (for new role assignment)
CREATE POLICY "Super admins can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()));
