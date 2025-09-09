-- Security Fix: Remove public profile exposure and create restrictive policies
-- First, drop the problematic public profile viewing policy
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;

-- Create more restrictive profile viewing policies
-- Users can view profiles of group members only
CREATE POLICY "Users can view group member profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    -- Users can view their own profile
    auth.uid() = user_id OR
    -- Users can view profiles of people in their groups
    EXISTS (
      SELECT 1 FROM group_memberships gm1
      JOIN group_memberships gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid() AND gm2.user_id = profiles.user_id
    ) OR
    -- Users can view profiles of group creators whose groups they've joined
    EXISTS (
      SELECT 1 FROM group_memberships gm
      JOIN book_groups bg ON gm.group_id = bg.id
      WHERE gm.user_id = auth.uid() AND bg.creator_id = profiles.user_id
    )
  )
);

-- Add missing columns for security features
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT false;

-- Create policy for public profiles (opt-in only)
CREATE POLICY "Users can view public opt-in profiles" 
ON public.profiles 
FOR SELECT 
USING (public_profile = true);

-- Add input length constraints to prevent data overflow attacks
ALTER TABLE public.profiles 
ADD CONSTRAINT IF NOT EXISTS profile_username_length CHECK (length(username) <= 50),
ADD CONSTRAINT IF NOT EXISTS profile_bio_length CHECK (length(bio) <= 500),
ADD CONSTRAINT IF NOT EXISTS profile_name_length CHECK (length(first_name) <= 100),
ADD CONSTRAINT IF NOT EXISTS profile_last_name_length CHECK (length(last_name) <= 100);

ALTER TABLE public.community_posts 
ADD CONSTRAINT IF NOT EXISTS post_content_length CHECK (length(content) <= 2000);

ALTER TABLE public.community_post_replies 
ADD CONSTRAINT IF NOT EXISTS reply_content_length CHECK (length(content) <= 1000);

ALTER TABLE public.highlights 
ADD CONSTRAINT IF NOT EXISTS highlight_text_length CHECK (length(quote_text) <= 1000);