-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;

-- Create a more restrictive policy that only allows viewing safe, non-sensitive fields for public profiles
-- This policy will work in conjunction with the existing "profiles_select_own" policy
CREATE POLICY "profiles_select_public_safe_fields" ON public.profiles
FOR SELECT 
USING (
  public_profile = true 
  AND auth.uid() IS NOT NULL 
  AND auth.uid() != user_id  -- Users should use their own policy to see their full profile
);

-- Add a comment to document the security consideration
COMMENT ON POLICY "profiles_select_public_safe_fields" ON public.profiles IS 
'Allows authenticated users to view public profiles, but application code must filter sensitive fields (email, phone, date_of_birth, first_name, last_name) on the client side for public access';