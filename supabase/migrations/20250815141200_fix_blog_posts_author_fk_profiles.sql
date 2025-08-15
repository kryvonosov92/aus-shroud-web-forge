-- Backfill missing profiles for all blog post authors
INSERT INTO public.profiles (user_id)
SELECT DISTINCT author_id
FROM public.blog_posts
WHERE author_id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- If the auto-named FK from blog_posts.author_id -> auth.users(id) is currently
-- named blog_posts_author_id_fkey, rename it to free up the expected embed name.
DO $$
DECLARE
  fk_points_to_auth_users BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class r ON c.confrelid = r.oid
    JOIN pg_namespace n ON r.relnamespace = n.oid
    WHERE c.conname = 'blog_posts_author_id_fkey'
      AND n.nspname = 'auth'
      AND r.relname = 'users'
  ) INTO fk_points_to_auth_users;

  IF fk_points_to_auth_users THEN
    ALTER TABLE public.blog_posts
    RENAME CONSTRAINT blog_posts_author_id_fkey TO blog_posts_author_id_auth_users_fkey;
  END IF;
END
$$;

-- Create the FK with the exact name used by the frontend embed to profiles.user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class r ON c.confrelid = r.oid
    JOIN pg_namespace n ON r.relnamespace = n.oid
    WHERE c.conname = 'blog_posts_author_id_fkey'
      AND n.nspname = 'public'
      AND r.relname = 'profiles'
  ) THEN
    ALTER TABLE public.blog_posts
    ADD CONSTRAINT blog_posts_author_id_fkey
    FOREIGN KEY (author_id)
    REFERENCES public.profiles(user_id)
    ON DELETE CASCADE;
  END IF;
END
$$;

