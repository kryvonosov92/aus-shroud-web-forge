DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Published authors are publicly viewable" ON public.profiles FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.blog_posts b WHERE b.author_id = profiles.user_id AND b.published = true));

DROP POLICY IF EXISTS "Authenticated write products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Allow public insert of quote requests" ON public.quote_requests;
CREATE POLICY "Anyone can submit a valid quote request" ON public.quote_requests FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(btrim(name)) BETWEEN 1 AND 200
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 255
    AND length(btrim(phone)) BETWEEN 1 AND 50
    AND length(btrim(message)) BETWEEN 1 AND 5000
    AND length(how_heard_about_us) <= 200
    AND coalesce(length(company_name), 0) <= 200
    AND coalesce(length(project_address), 0) <= 500
    AND coalesce(array_length(attachment_urls, 1), 0) <= 10
  );