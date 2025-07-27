-- Create storage bucket for quote attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('quote-attachments', 'quote-attachments', false);

-- Create storage policies for quote attachments
CREATE POLICY "Allow public upload of quote attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'quote-attachments');

CREATE POLICY "Allow public read of quote attachments" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'quote-attachments');

-- Create quote_requests table
CREATE TABLE public.quote_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  property_type TEXT NOT NULL,
  project_details TEXT NOT NULL,
  attachment_urls TEXT[], -- Array to store multiple file URLs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for quote requests (public insert, admin read)
CREATE POLICY "Allow public insert of quote requests" 
ON public.quote_requests 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_quote_requests_updated_at
BEFORE UPDATE ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();