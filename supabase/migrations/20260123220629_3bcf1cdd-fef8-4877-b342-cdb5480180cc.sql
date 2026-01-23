-- Create product_questions table
CREATE TABLE public.product_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'rejected')),
  is_visible BOOLEAN NOT NULL DEFAULT true,
  asked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_product_questions_product_id ON public.product_questions(product_id);
CREATE INDEX idx_product_questions_seller_id ON public.product_questions(seller_id);
CREATE INDEX idx_product_questions_customer_id ON public.product_questions(customer_id);
CREATE INDEX idx_product_questions_status ON public.product_questions(status);

-- Enable RLS
ALTER TABLE public.product_questions ENABLE ROW LEVEL SECURITY;

-- Anyone can view visible answered questions
CREATE POLICY "Anyone can view answered questions"
ON public.product_questions
FOR SELECT
USING (status = 'answered' AND is_visible = true);

-- Customers can view their own questions (even pending)
CREATE POLICY "Customers can view their own questions"
ON public.product_questions
FOR SELECT
USING (customer_id = auth.uid());

-- Sellers can view questions for their products
CREATE POLICY "Sellers can view their product questions"
ON public.product_questions
FOR SELECT
USING (seller_id = auth.uid() AND has_role(auth.uid(), 'seller'::app_role));

-- Admins can view all questions
CREATE POLICY "Admins can view all questions"
ON public.product_questions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Customers can ask questions
CREATE POLICY "Customers can ask questions"
ON public.product_questions
FOR INSERT
WITH CHECK (customer_id = auth.uid());

-- Sellers can answer their product questions
CREATE POLICY "Sellers can answer questions"
ON public.product_questions
FOR UPDATE
USING (seller_id = auth.uid() AND has_role(auth.uid(), 'seller'::app_role));

-- Admins can update any question (for moderation)
CREATE POLICY "Admins can moderate questions"
ON public.product_questions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete questions
CREATE POLICY "Admins can delete questions"
ON public.product_questions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_product_questions_updated_at
BEFORE UPDATE ON public.product_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();