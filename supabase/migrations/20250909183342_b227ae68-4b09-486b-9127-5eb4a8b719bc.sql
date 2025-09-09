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

-- Add a public_profile flag for users who want to be discoverable
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT false;

-- Create policy for public profiles (opt-in only)
CREATE POLICY "Users can view public opt-in profiles" 
ON public.profiles 
FOR SELECT 
USING (public_profile = true);

-- Secure highlights table - only allow viewing highlights from followed users or group members
DROP POLICY IF EXISTS "Users can view their own highlights" ON public.highlights;

CREATE POLICY "Users can view own highlights" 
ON public.highlights 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view group member highlights" 
ON public.highlights 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM group_memberships gm1
    JOIN group_memberships gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid() AND gm2.user_id = highlights.user_id
  )
);

-- Add input length constraints to prevent data overflow attacks
ALTER TABLE public.profiles 
ADD CONSTRAINT profile_username_length CHECK (length(username) <= 50),
ADD CONSTRAINT profile_bio_length CHECK (length(bio) <= 500),
ADD CONSTRAINT profile_name_length CHECK (length(first_name) <= 100),
ADD CONSTRAINT profile_last_name_length CHECK (length(last_name) <= 100);

ALTER TABLE public.community_posts 
ADD CONSTRAINT post_content_length CHECK (length(content) <= 2000);

ALTER TABLE public.community_post_replies 
ADD CONSTRAINT reply_content_length CHECK (length(content) <= 1000);

ALTER TABLE public.highlights 
ADD CONSTRAINT highlight_text_length CHECK (length(quote_text) <= 1000);

-- Add rate limiting table for guest users
CREATE TABLE IF NOT EXISTS public.guest_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id text NOT NULL,
  action_type text NOT NULL,
  action_count integer DEFAULT 0,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE public.guest_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limits
CREATE POLICY "System can manage rate limits" 
ON public.guest_rate_limits 
FOR ALL 
USING (false);

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION public.check_guest_rate_limit(
  guest_id_input text,
  action_type_input text,
  max_actions integer DEFAULT 10,
  window_minutes integer DEFAULT 60
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
  window_start_time timestamp with time zone;
BEGIN
  -- Clean up old entries
  DELETE FROM guest_rate_limits 
  WHERE window_start < now() - interval '1 hour' * window_minutes / 60;
  
  -- Get current count for this guest and action type
  SELECT action_count, window_start 
  INTO current_count, window_start_time
  FROM guest_rate_limits 
  WHERE guest_id = guest_id_input AND action_type = action_type_input
  AND window_start > now() - interval '1 minute' * window_minutes;
  
  -- If no record or window expired, create new one
  IF current_count IS NULL THEN
    INSERT INTO guest_rate_limits (guest_id, action_type, action_count, window_start)
    VALUES (guest_id_input, action_type_input, 1, now());
    RETURN true;
  END IF;
  
  -- Check if limit exceeded
  IF current_count >= max_actions THEN
    RETURN false;
  END IF;
  
  -- Increment counter
  UPDATE guest_rate_limits 
  SET action_count = action_count + 1
  WHERE guest_id = guest_id_input AND action_type = action_type_input;
  
  RETURN true;
END;
$$;