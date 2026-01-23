-- Create categories table for admin-editable categories with subcategories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT 'Folder',
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public read access for everyone
CREATE POLICY "Categories are viewable by everyone"
ON public.categories
FOR SELECT
USING (is_active = true);

-- Admins can manage categories
CREATE POLICY "Admins can insert categories"
ON public.categories
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update categories"
ON public.categories
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete categories"
ON public.categories
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories with subcategories
INSERT INTO public.categories (id, name, slug, icon, parent_id, display_order) VALUES
-- Main categories
('11111111-1111-1111-1111-111111111101', 'Electronics', 'electronics', 'Smartphone', NULL, 1),
('11111111-1111-1111-1111-111111111102', 'Fashion', 'fashion', 'Shirt', NULL, 2),
('11111111-1111-1111-1111-111111111103', 'Home & Living', 'home-living', 'Home', NULL, 3),
('11111111-1111-1111-1111-111111111104', 'Health & Beauty', 'health-beauty', 'Heart', NULL, 4),
('11111111-1111-1111-1111-111111111105', 'Sports & Outdoor', 'sports-outdoor', 'Dumbbell', NULL, 5),
('11111111-1111-1111-1111-111111111106', 'Groceries', 'groceries', 'ShoppingBasket', NULL, 6),
('11111111-1111-1111-1111-111111111107', 'Babies & Toys', 'babies-toys', 'Baby', NULL, 7),
('11111111-1111-1111-1111-111111111108', 'Motors', 'motors', 'Car', NULL, 8);

-- Sub-categories for Electronics
INSERT INTO public.categories (name, slug, icon, parent_id, display_order) VALUES
('Smartphones', 'smartphones', 'Smartphone', '11111111-1111-1111-1111-111111111101', 1),
('Laptops', 'laptops', 'Laptop', '11111111-1111-1111-1111-111111111101', 2),
('Tablets', 'tablets', 'Tablet', '11111111-1111-1111-1111-111111111101', 3),
('Accessories', 'electronics-accessories', 'Headphones', '11111111-1111-1111-1111-111111111101', 4);

-- Sub-categories for Fashion
INSERT INTO public.categories (name, slug, icon, parent_id, display_order) VALUES
('Clothes', 'clothes', 'Shirt', '11111111-1111-1111-1111-111111111102', 1),
('Shoes', 'shoes', 'Footprints', '11111111-1111-1111-1111-111111111102', 2),
('Bags', 'bags', 'ShoppingBag', '11111111-1111-1111-1111-111111111102', 3),
('Jewelry', 'jewelry', 'Gem', '11111111-1111-1111-1111-111111111102', 4);

-- Sub-categories for Home & Living
INSERT INTO public.categories (name, slug, icon, parent_id, display_order) VALUES
('Furniture', 'furniture', 'Sofa', '11111111-1111-1111-1111-111111111103', 1),
('Kitchen', 'kitchen', 'ChefHat', '11111111-1111-1111-1111-111111111103', 2),
('Decor', 'decor', 'Lamp', '11111111-1111-1111-1111-111111111103', 3);

-- Sub-categories for Health & Beauty
INSERT INTO public.categories (name, slug, icon, parent_id, display_order) VALUES
('Skincare', 'skincare', 'Droplets', '11111111-1111-1111-1111-111111111104', 1),
('Makeup', 'makeup', 'Palette', '11111111-1111-1111-1111-111111111104', 2),
('Fragrances', 'fragrances', 'Flower', '11111111-1111-1111-1111-111111111104', 3);