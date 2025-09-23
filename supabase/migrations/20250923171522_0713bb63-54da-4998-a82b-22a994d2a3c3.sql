-- Update RLS policies to allow public viewing of community posts and replies

-- Drop the existing restrictive policy for community posts
DROP POLICY IF EXISTS "Users can view all posts" ON public.community_posts;

-- Create new public viewing policy for community posts
CREATE POLICY "Everyone can view all posts" 
ON public.community_posts 
FOR SELECT 
USING (true);

-- Drop the existing restrictive policy for community post replies  
DROP POLICY IF EXISTS "Users can view all replies" ON public.community_post_replies;

-- Create new public viewing policy for community post replies
CREATE POLICY "Everyone can view all replies" 
ON public.community_post_replies 
FOR SELECT 
USING (true);

-- Drop the existing restrictive policy for community post likes
DROP POLICY IF EXISTS "Users can view all likes" ON public.community_post_likes;

-- Create new public viewing policy for community post likes
CREATE POLICY "Everyone can view all likes" 
ON public.community_post_likes 
FOR SELECT 
USING (true);

-- Note: Creating, updating, and deleting posts/replies/likes still requires authentication
-- via existing policies that check auth.uid() = user_id