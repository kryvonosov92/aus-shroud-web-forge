-- Ensure RLS is enabled
alter table if exists public.products enable row level security;

-- Public read access
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and policyname = 'Public read products'
  ) then
    create policy "Public read products" on public.products
      for select
      to anon
      using (true);
  end if;
end $$;

-- Authenticated full write access
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and policyname = 'Authenticated write products'
  ) then
    create policy "Authenticated write products" on public.products
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;

