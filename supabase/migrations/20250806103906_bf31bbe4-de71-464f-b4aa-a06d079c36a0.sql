-- Update Thermacore Hood product to use the generated hood image
UPDATE public.products 
SET image_url = '/src/assets/hood-shroud.jpg'
WHERE name = 'ThermaCore© Hood';