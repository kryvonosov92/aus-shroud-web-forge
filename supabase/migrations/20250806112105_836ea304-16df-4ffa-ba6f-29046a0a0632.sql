-- Fix the Tapered Shroud image by using an existing working image path as template
UPDATE public.products 
SET image_url = '/lovable-uploads/corner-shroud-image.png'
WHERE name = 'ThermaCore© Tapered Shroud';