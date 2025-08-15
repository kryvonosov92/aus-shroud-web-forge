-- Add flexible tabbed content jsonb column for products
alter table if exists public.products
  add column if not exists tabbed_content jsonb;

-- Optional: backfill initial value from existing specifications/colour_options if present
-- This creates a two-tab structure approximating the current UI
update public.products p
set tabbed_content = jsonb_build_object(
  'tabs', jsonb_build_array(
    jsonb_build_object(
      'id','specifications',
      'title','Specification Details',
      'columns', (
        -- two columns structure
        jsonb_build_array(
          jsonb_build_object(
            'sections', jsonb_build_array(
              jsonb_build_object(
                'heading','Overview',
                'rows', (
                  coalesce((
                    select jsonb_agg(jsonb_build_object('label', key, 'value', value::text))
                    from jsonb_each_text(coalesce(p.specifications->'overview','{}'::jsonb))
                  ), '[]'::jsonb)
                )
              ),
              jsonb_build_object(
                'heading','Product Applications',
                'rows', (
                  coalesce((
                    select jsonb_agg(jsonb_build_object('label', key, 'value', value::text))
                    from jsonb_each_text(coalesce(p.specifications->'applications','{}'::jsonb))
                  ), '[]'::jsonb)
                )
              )
            )
          ),
          jsonb_build_object(
            'sections', jsonb_build_array(
              jsonb_build_object(
                'heading','Dimensions & Performance',
                'rows', (
                  coalesce((
                    select jsonb_agg(jsonb_build_object('label', key, 'value', value::text))
                    from jsonb_each_text(coalesce(p.specifications->'dimensions','{}'::jsonb))
                  ), '[]'::jsonb)
                )
              ),
              jsonb_build_object(
                'heading','Product Warranty',
                'rows', (
                  coalesce((
                    select jsonb_agg(jsonb_build_object('label', key, 'value', value::text))
                    from jsonb_each_text(coalesce(p.specifications->'warranty','{}'::jsonb))
                  ), '[]'::jsonb)
                )
              )
            )
          )
        )
      )
    ),
    jsonb_build_object(
      'id','colours',
      'title','Colour Options',
      'columns', jsonb_build_array(
        jsonb_build_object(
          'sections', jsonb_build_array(
            jsonb_build_object(
              'heading','Powder Coating Systems',
              'rows', (
                coalesce((
                  select jsonb_agg(jsonb_build_object('label', s, 'value','Available'))
                  from jsonb_array_elements_text(coalesce(p.colour_options->'systems','[]'::jsonb)) s
                ), '[]'::jsonb)
              )
            )
          )
        ),
        jsonb_build_object(
          'sections', jsonb_build_array(
            jsonb_build_object(
              'heading','Coating Properties',
              'rows', (
                coalesce((
                  select jsonb_agg(jsonb_build_object('label', key, 'value', value::text))
                  from jsonb_each_text(coalesce(p.colour_options->'properties','{}'::jsonb))
                ), '[]'::jsonb)
              )
            )
          )
        )
      )
    )
  )
)
where p.tabbed_content is null;

