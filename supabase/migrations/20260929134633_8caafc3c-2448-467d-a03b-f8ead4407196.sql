DO $$ BEGIN CREATE TYPE public.app_role AS ENUM ('admin','user'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- Existing admin-panel users become admins
INSERT INTO public.user_roles (user_id, role) SELECT id, 'admin' FROM auth.users ON CONFLICT DO NOTHING;

-- aws-media: only admins may list/write; public URLs still serve images
DROP POLICY IF EXISTS "Allow authenticated read of aws-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert to aws-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update to aws-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete from aws-media" ON storage.objects;
CREATE POLICY "Admins can read aws-media" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'aws-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can upload to aws-media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'aws-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update aws-media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'aws-media' AND public.has_role(auth.uid(), 'admin')) WITH CHECK (bucket_id = 'aws-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete from aws-media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'aws-media' AND public.has_role(auth.uid(), 'admin'));

-- quote-attachments: no public access; uploads happen server-side, admins can read
DROP POLICY IF EXISTS "Allow public read of quote attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload of quote attachments" ON storage.objects;
CREATE POLICY "Admins can read quote attachments" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'quote-attachments' AND public.has_role(auth.uid(), 'admin'));