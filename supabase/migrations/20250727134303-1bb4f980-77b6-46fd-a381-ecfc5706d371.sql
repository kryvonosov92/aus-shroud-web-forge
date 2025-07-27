-- Remove architect_designer column from quote_requests table
ALTER TABLE public.quote_requests 
DROP COLUMN IF EXISTS architect_designer;