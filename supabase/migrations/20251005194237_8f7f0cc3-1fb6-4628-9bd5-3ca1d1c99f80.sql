-- Fix 1: Create a view for safe public profile fields to prevent PII exposure
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  user_id,
  username,
  display_name,
  name,
  bio,
  profile_picture_url,
  country,
  created_at
FROM public.profiles
WHERE public_profile = true;

-- Grant select on the view to authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;

-- Fix 2: Update get_user_display_name function with proper access controls
CREATE OR REPLACE FUNCTION public.get_user_display_name(user_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  display_name text;
  is_accessible boolean;
BEGIN
  -- Check if caller can access this profile
  -- User can access if: it's their own profile OR the profile is public
  SELECT 
    (user_id = auth.uid() OR public_profile = true)
  INTO is_accessible
  FROM public.profiles
  WHERE user_id = user_uuid;
  
  -- If not accessible, return generic name
  IF NOT COALESCE(is_accessible, false) THEN
    RETURN 'Unknown User';
  END IF;
  
  -- Return display name for accessible profiles
  SELECT COALESCE(
    p.display_name,
    p.name,
    p.username,
    p.first_name || ' ' || p.last_name,
    p.email
  )
  INTO display_name
  FROM public.profiles p
  WHERE p.user_id = user_uuid
  LIMIT 1;
  
  RETURN COALESCE(display_name, 'Unknown User');
END;
$$;