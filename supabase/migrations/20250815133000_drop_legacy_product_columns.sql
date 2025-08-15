-- Drop legacy columns no longer used by the app
alter table if exists public.products
  drop column if exists specifications,
  drop column if exists colour_options;

