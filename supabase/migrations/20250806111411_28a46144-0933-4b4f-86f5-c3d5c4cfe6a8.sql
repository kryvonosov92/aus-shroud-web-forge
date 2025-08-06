-- Update the Thermacore Tapered Shroud product image to use the public folder
UPDATE public.products 
SET image_url = '/products/tapered-shroud-1.png'
WHERE name = 'ThermaCore© Tapered Shroud';