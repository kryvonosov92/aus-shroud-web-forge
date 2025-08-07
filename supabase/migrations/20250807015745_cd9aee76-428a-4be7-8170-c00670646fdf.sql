-- Update product names from THERMACORE© to ThermaCore©
UPDATE products 
SET name = REPLACE(name, 'THERMACORE©', 'ThermaCore©')
WHERE name LIKE '%THERMACORE©%';