-- Fix the handle_new_user function to correctly map LinkedIn OIDC metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'name',
      NEW.raw_user_meta_data ->> 'full_name',
      CONCAT(NEW.raw_user_meta_data ->> 'given_name', ' ', NEW.raw_user_meta_data ->> 'family_name')
    ),
    COALESCE(
      NEW.raw_user_meta_data ->> 'picture',
      NEW.raw_user_meta_data ->> 'avatar_url'
    )
  );
  RETURN NEW;
END;
$function$;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  
-- Update existing profile with correct data
UPDATE public.profiles 
SET 
  full_name = (
    SELECT COALESCE(
      raw_user_meta_data ->> 'name',
      raw_user_meta_data ->> 'full_name',
      CONCAT(raw_user_meta_data ->> 'given_name', ' ', raw_user_meta_data ->> 'family_name')
    )
    FROM auth.users 
    WHERE auth.users.id = profiles.user_id
  ),
  avatar_url = (
    SELECT COALESCE(
      raw_user_meta_data ->> 'picture',
      raw_user_meta_data ->> 'avatar_url'
    )
    FROM auth.users 
    WHERE auth.users.id = profiles.user_id
  )
WHERE full_name IS NULL OR avatar_url IS NULL;