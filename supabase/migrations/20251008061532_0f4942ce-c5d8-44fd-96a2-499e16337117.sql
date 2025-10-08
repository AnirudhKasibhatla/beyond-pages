-- Update RLS policy to allow viewing basic profile fields for all authenticated users
DROP POLICY IF EXISTS "profiles_select_public_safe_fields" ON public.profiles;

CREATE POLICY "profiles_select_other_users_basic_info"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() <> user_id
);

-- Make books readable by others (only read status books with reviews)
CREATE POLICY "Users can view read books with reviews from others"
ON public.books
FOR SELECT
TO authenticated
USING (
  status = 'read' 
  AND rating IS NOT NULL 
  AND user_id <> auth.uid()
);

-- Make highlights viewable by others
CREATE POLICY "Users can view highlights from others"
ON public.highlights
FOR SELECT
TO authenticated
USING (user_id <> auth.uid());