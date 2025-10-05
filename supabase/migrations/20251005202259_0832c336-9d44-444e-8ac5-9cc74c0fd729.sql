-- Function to sync user_name when a community post reply is inserted
CREATE OR REPLACE FUNCTION public.sync_community_reply_user_name()
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
  
  -- Set the user_name on the reply
  NEW.user_name := COALESCE(profile_name, 'Anonymous');
  
  RETURN NEW;
END;
$$;

-- Create trigger to sync user_name on reply insert
DROP TRIGGER IF EXISTS trigger_sync_community_reply_user_name ON public.community_post_replies;
CREATE TRIGGER trigger_sync_community_reply_user_name
BEFORE INSERT ON public.community_post_replies
FOR EACH ROW
EXECUTE FUNCTION public.sync_community_reply_user_name();

-- Function to update reply user_names when profile name changes
CREATE OR REPLACE FUNCTION public.update_community_replies_user_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update all replies for this user when their name changes
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    UPDATE public.community_post_replies
    SET user_name = NEW.name
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update replies when profile name changes
DROP TRIGGER IF EXISTS trigger_update_community_replies_user_name ON public.profiles;
CREATE TRIGGER trigger_update_community_replies_user_name
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_community_replies_user_name();

-- Backfill user_name for existing replies
UPDATE public.community_post_replies cpr
SET user_name = p.name
FROM public.profiles p
WHERE cpr.user_id = p.user_id
AND (cpr.user_name IS NULL OR cpr.user_name = 'Anonymous');