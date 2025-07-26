-- Enable Row Level Security on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to products (since this is a public-facing product catalog)
CREATE POLICY "Allow public read access to products" 
ON public.products 
FOR SELECT 
USING (true);