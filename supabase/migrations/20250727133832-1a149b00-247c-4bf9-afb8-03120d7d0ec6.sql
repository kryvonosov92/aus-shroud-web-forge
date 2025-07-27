-- Update quote_requests table to match HekaHoods form fields
ALTER TABLE public.quote_requests 
DROP COLUMN IF EXISTS property_type,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS project_address TEXT,
ADD COLUMN IF NOT EXISTS architect_designer TEXT,
ADD COLUMN IF NOT EXISTS how_heard_about_us TEXT NOT NULL DEFAULT '';

-- Update the column name to match HekaHoods (project_details -> message)
ALTER TABLE public.quote_requests 
RENAME COLUMN project_details TO message;