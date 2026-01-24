-- Create enum for permission features
CREATE TYPE public.permission_feature AS ENUM (
  'banners',
  'products', 
  'orders',
  'payouts',
  'flash_sales',
  'users',
  'categories',
  'reviews',
  'returns',
  'analytics',
  'settings',
  'vouchers'
);

-- Create enum for permission actions
CREATE TYPE public.permission_action AS ENUM (
  'view',
  'create',
  'edit',
  'delete'
);

-- Create staff_roles table for custom admin roles
CREATE TABLE public.staff_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system_role BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create role_permissions table
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.staff_roles(id) ON DELETE CASCADE,
  feature permission_feature NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT false,
  can_create BOOLEAN NOT NULL DEFAULT false,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  can_delete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role_id, feature)
);

-- Create staff_role_assignments table to assign roles to users
CREATE TABLE public.staff_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.staff_roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_role_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staff_roles
CREATE POLICY "Super admin can manage staff roles"
ON public.staff_roles FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Staff can view roles"
ON public.staff_roles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.staff_role_assignments
    WHERE user_id = auth.uid()
  )
);

-- RLS Policies for role_permissions
CREATE POLICY "Super admin can manage role permissions"
ON public.role_permissions FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Staff can view their permissions"
ON public.role_permissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.staff_role_assignments sra
    WHERE sra.user_id = auth.uid() AND sra.role_id = role_permissions.role_id
  ) OR is_super_admin(auth.uid())
);

-- RLS Policies for staff_role_assignments
CREATE POLICY "Super admin can manage role assignments"
ON public.staff_role_assignments FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users can view their own assignment"
ON public.staff_role_assignments FOR SELECT
USING (user_id = auth.uid() OR is_super_admin(auth.uid()));

-- Create function to get user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id UUID)
RETURNS TABLE (
  feature permission_feature,
  can_view BOOLEAN,
  can_create BOOLEAN,
  can_edit BOOLEAN,
  can_delete BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    rp.feature,
    rp.can_view,
    rp.can_create,
    rp.can_edit,
    rp.can_delete
  FROM role_permissions rp
  JOIN staff_role_assignments sra ON sra.role_id = rp.role_id
  WHERE sra.user_id = _user_id
$$;

-- Create function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _feature permission_feature, _action permission_action)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN staff_role_assignments sra ON sra.role_id = rp.role_id
    WHERE sra.user_id = _user_id
      AND rp.feature = _feature
      AND (
        (_action = 'view' AND rp.can_view = true) OR
        (_action = 'create' AND rp.can_create = true) OR
        (_action = 'edit' AND rp.can_edit = true) OR
        (_action = 'delete' AND rp.can_delete = true)
      )
  ) OR is_super_admin(_user_id)
$$;

-- Insert default system roles
INSERT INTO public.staff_roles (name, description, is_system_role) VALUES
('Super Admin', 'Full access to all features', true),
('Manager', 'Can manage products, orders, and users', true),
('Content Editor', 'Can manage banners, categories, and content', true),
('Support Staff', 'Can view orders and handle customer issues', true);

-- Get the role IDs and insert default permissions
DO $$
DECLARE
  super_admin_id UUID;
  manager_id UUID;
  content_editor_id UUID;
  support_staff_id UUID;
BEGIN
  SELECT id INTO super_admin_id FROM staff_roles WHERE name = 'Super Admin';
  SELECT id INTO manager_id FROM staff_roles WHERE name = 'Manager';
  SELECT id INTO content_editor_id FROM staff_roles WHERE name = 'Content Editor';
  SELECT id INTO support_staff_id FROM staff_roles WHERE name = 'Support Staff';

  -- Super Admin gets all permissions
  INSERT INTO role_permissions (role_id, feature, can_view, can_create, can_edit, can_delete)
  SELECT super_admin_id, f.feature, true, true, true, true
  FROM unnest(enum_range(NULL::permission_feature)) AS f(feature);

  -- Manager permissions
  INSERT INTO role_permissions (role_id, feature, can_view, can_create, can_edit, can_delete) VALUES
  (manager_id, 'products', true, true, true, false),
  (manager_id, 'orders', true, false, true, false),
  (manager_id, 'users', true, false, true, false),
  (manager_id, 'reviews', true, false, true, true),
  (manager_id, 'returns', true, false, true, false),
  (manager_id, 'analytics', true, false, false, false);

  -- Content Editor permissions
  INSERT INTO role_permissions (role_id, feature, can_view, can_create, can_edit, can_delete) VALUES
  (content_editor_id, 'banners', true, true, true, true),
  (content_editor_id, 'categories', true, true, true, false),
  (content_editor_id, 'flash_sales', true, true, true, false),
  (content_editor_id, 'vouchers', true, true, true, false);

  -- Support Staff permissions
  INSERT INTO role_permissions (role_id, feature, can_view, can_create, can_edit, can_delete) VALUES
  (support_staff_id, 'orders', true, false, true, false),
  (support_staff_id, 'users', true, false, false, false),
  (support_staff_id, 'returns', true, false, true, false),
  (support_staff_id, 'reviews', true, false, false, false);
END $$;

-- Add trigger for updated_at
CREATE TRIGGER update_staff_roles_updated_at
BEFORE UPDATE ON public.staff_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();