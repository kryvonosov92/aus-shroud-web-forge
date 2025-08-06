-- Update the Tapered Shroud to use the correct image path now that the file exists
UPDATE public.products 
SET image_url = '/lovable-uploads/21405166-0770-45e7-9b2e-c638b3e83a9b.png'
WHERE name = 'ThermaCore© Tapered Shroud';