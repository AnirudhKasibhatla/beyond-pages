-- Ensure all profiles have a name value
UPDATE profiles 
SET name = COALESCE(
  name,
  display_name,
  username,
  CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')),
  email,
  'User'
)
WHERE name IS NULL OR name = '';

-- Update the sync functions to use a better fallback chain
CREATE OR REPLACE FUNCTION public.sync_book_user_name()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  profile_name text;
BEGIN
  SELECT COALESCE(
    name,
    display_name,
    username,
    CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')),
    email,
    'User'
  ) INTO profile_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;
  
  NEW.user_name := COALESCE(profile_name, 'User');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_community_post_user_name()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  profile_name text;
BEGIN
  SELECT COALESCE(
    name,
    display_name,
    username,
    CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')),
    email,
    'User'
  ) INTO profile_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;
  
  NEW.user_name := COALESCE(profile_name, 'User');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_community_reply_user_name()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  profile_name text;
BEGIN
  SELECT COALESCE(
    name,
    display_name,
    username,
    CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')),
    email,
    'User'
  ) INTO profile_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;
  
  NEW.user_name := COALESCE(profile_name, 'User');
  RETURN NEW;
END;
$function$;

-- Backfill existing community posts with user names
UPDATE community_posts cp
SET user_name = COALESCE(
  (SELECT COALESCE(
    p.name,
    p.display_name,
    p.username,
    CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, '')),
    p.email,
    'User'
  )
  FROM profiles p
  WHERE p.user_id = cp.user_id),
  'User'
)
WHERE user_name IS NULL OR user_name = '' OR user_name = 'Anonymous';

-- Backfill existing community replies with user names
UPDATE community_post_replies cpr
SET user_name = COALESCE(
  (SELECT COALESCE(
    p.name,
    p.display_name,
    p.username,
    CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, '')),
    p.email,
    'User'
  )
  FROM profiles p
  WHERE p.user_id = cpr.user_id),
  'User'
)
WHERE user_name IS NULL OR user_name = '' OR user_name = 'Anonymous';

-- Backfill existing books with user names
UPDATE books b
SET user_name = COALESCE(
  (SELECT COALESCE(
    p.name,
    p.display_name,
    p.username,
    CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, '')),
    p.email,
    'User'
  )
  FROM profiles p
  WHERE p.user_id = b.user_id),
  'User'
)
WHERE user_name IS NULL OR user_name = '' OR user_name = 'Anonymous';

-- Add group_id column to community_posts for linking posts to groups
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES book_groups(id) ON DELETE CASCADE;

-- Update the group join trigger to create a post with group link
CREATE OR REPLACE FUNCTION public.create_post_on_group_joined()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  group_name text;
BEGIN
  SELECT name INTO group_name
  FROM public.book_groups
  WHERE id = NEW.group_id;

  INSERT INTO public.community_posts (user_id, content, group_id)
  VALUES (
    NEW.user_id,
    'Joined the book group: "' || group_name || '"!',
    NEW.group_id
  );
  RETURN NEW;
END;
$function$;