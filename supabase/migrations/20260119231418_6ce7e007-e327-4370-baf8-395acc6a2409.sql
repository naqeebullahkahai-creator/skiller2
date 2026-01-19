-- Create order_items table for storing individual order items
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  seller_id UUID NOT NULL,
  title TEXT NOT NULL,
  price_pkr NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Customers can view their own order items
CREATE POLICY "Customers can view their own order items"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.customer_id = auth.uid()
  )
);

-- Customers can insert order items for their orders
CREATE POLICY "Customers can insert order items for their orders"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.customer_id = auth.uid()
  )
);

-- Admins can view all order items
CREATE POLICY "Admins can view all order items"
ON public.order_items
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Sellers can view order items for their products
CREATE POLICY "Sellers can view their order items"
ON public.order_items
FOR SELECT
USING (
  has_role(auth.uid(), 'seller'::app_role) AND seller_id = auth.uid()
);

-- Create function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  order_count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO order_count FROM public.orders;
  RETURN 'FZ-' || LPAD(order_count::TEXT, 5, '0');
END;
$$;

-- Add order_number column to orders table
ALTER TABLE public.orders ADD COLUMN order_number TEXT UNIQUE;

-- Create trigger to auto-generate order number
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.order_number := generate_order_number();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_order_number();

-- Function to decrease stock when order is placed
CREATE OR REPLACE FUNCTION public.decrease_product_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  SELECT stock_count INTO current_stock
  FROM public.products
  WHERE id = p_product_id;
  
  IF current_stock IS NULL THEN
    RETURN FALSE;
  END IF;
  
  IF current_stock < p_quantity THEN
    RETURN FALSE;
  END IF;
  
  UPDATE public.products
  SET stock_count = stock_count - p_quantity, updated_at = now()
  WHERE id = p_product_id;
  
  RETURN TRUE;
END;
$$;