-- Function to sync user_name when a community post is inserted
CREATE OR REPLACE FUNCTION public.sync_community_post_user_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_name text;
BEGIN
  -- Get the user's name from profiles
  SELECT name INTO profile_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;
  
  -- Set the user_name on the post
  NEW.user_name := COALESCE(profile_name, 'Anonymous');
  
  RETURN NEW;
END;
$$;

-- Create trigger to sync user_name on community post insert
DROP TRIGGER IF EXISTS trigger_sync_community_post_user_name ON public.community_posts;
CREATE TRIGGER trigger_sync_community_post_user_name
BEFORE INSERT ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.sync_community_post_user_name();

-- Function to update community post user_names when profile name changes
CREATE OR REPLACE FUNCTION public.update_community_posts_user_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update all community posts for this user when their name changes
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    UPDATE public.community_posts
    SET user_name = NEW.name
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update community posts when profile name changes
DROP TRIGGER IF EXISTS trigger_update_community_posts_user_name ON public.profiles;
CREATE TRIGGER trigger_update_community_posts_user_name
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_community_posts_user_name();

-- Backfill user_name for existing community posts
UPDATE public.community_posts cp
SET user_name = p.name
FROM public.profiles p
WHERE cp.user_id = p.user_id
AND (cp.user_name IS NULL OR cp.user_name = 'Anonymous');