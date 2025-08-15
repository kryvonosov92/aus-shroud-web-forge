-- Ensure every blog post author has a corresponding profile row
INSERT INTO public.profiles (user_id)
SELECT DISTINCT author_id
FROM public.blog_posts
WHERE author_id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Add a foreign key from blog_posts.author_id to profiles.user_id so nested selects
-- like profiles!blog_posts_author_id_fkey (...) work without changing frontend code
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'blog_posts_author_id_fkey'
  ) THEN
    ALTER TABLE public.blog_posts
    ADD CONSTRAINT blog_posts_author_id_fkey
    FOREIGN KEY (author_id)
    REFERENCES public.profiles(user_id)
    ON DELETE CASCADE;
  END IF;
END
$$;

-- Profiles already have a SELECT policy allowing public reads; keep as-is
-- Blog posts already allow public reads for published posts; keep as-is

