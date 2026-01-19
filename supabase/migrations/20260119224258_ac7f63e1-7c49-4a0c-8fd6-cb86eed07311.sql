-- Step 1: Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'seller', 'customer');

-- Step 2: Create product status enum
CREATE TYPE public.product_status AS ENUM ('pending', 'active', 'rejected');

-- Step 3: Create payment status enum
CREATE TYPE public.payment_status AS ENUM ('unpaid', 'paid');

-- Step 4: Create order status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- Step 5: Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Step 6: Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Step 7: Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  brand TEXT,
  sku TEXT,
  price_pkr DECIMAL(12, 2) NOT NULL CHECK (price_pkr >= 0),
  discount_price_pkr DECIMAL(12, 2) CHECK (discount_price_pkr >= 0),
  stock_count INTEGER NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
  images TEXT[] DEFAULT '{}',
  status product_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Step 8: Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total_amount_pkr DECIMAL(12, 2) NOT NULL CHECK (total_amount_pkr >= 0),
  payment_method TEXT NOT NULL DEFAULT 'COD',
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  order_status order_status NOT NULL DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Step 9: Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Step 10: Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 11: Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Step 12: Profiles RLS policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Step 13: User roles RLS policies
CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Step 14: Products RLS policies
CREATE POLICY "Anyone can view active products"
ON public.products FOR SELECT
USING (status = 'active');

CREATE POLICY "Sellers can view their own products"
ON public.products FOR SELECT
TO authenticated
USING (seller_id = auth.uid());

CREATE POLICY "Sellers can insert their own products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (seller_id = auth.uid() AND public.has_role(auth.uid(), 'seller'));

CREATE POLICY "Sellers can update their own products"
ON public.products FOR UPDATE
TO authenticated
USING (seller_id = auth.uid() AND public.has_role(auth.uid(), 'seller'));

CREATE POLICY "Sellers can delete their own products"
ON public.products FOR DELETE
TO authenticated
USING (seller_id = auth.uid() AND public.has_role(auth.uid(), 'seller'));

CREATE POLICY "Admins can view all products"
ON public.products FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all products"
ON public.products FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Step 15: Orders RLS policies
CREATE POLICY "Customers can view their own orders"
ON public.orders FOR SELECT
TO authenticated
USING (customer_id = auth.uid());

CREATE POLICY "Customers can create their own orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Sellers can view orders containing their products"
ON public.orders FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'seller') AND
  EXISTS (
    SELECT 1 FROM jsonb_array_elements(items) AS item
    WHERE (item->>'seller_id')::UUID = auth.uid()
  )
);

CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all orders"
ON public.orders FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Step 16: Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 17: Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Step 18: Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_seller BOOLEAN;
BEGIN
  -- Check if user signed up as seller (from metadata)
  is_seller := COALESCE((NEW.raw_user_meta_data->>'is_seller')::BOOLEAN, FALSE);
  
  -- Insert profile
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE WHEN is_seller THEN 'seller'::app_role ELSE 'customer'::app_role END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 19: Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();