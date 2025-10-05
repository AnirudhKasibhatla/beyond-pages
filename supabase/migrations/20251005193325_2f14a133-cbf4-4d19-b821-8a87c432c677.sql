-- Add user_name column to tables where users create content

-- Books table
ALTER TABLE public.books 
ADD COLUMN user_name text;

-- Community posts table
ALTER TABLE public.community_posts 
ADD COLUMN user_name text;

-- Book events table
ALTER TABLE public.book_events 
ADD COLUMN creator_name text;

-- Book groups table
ALTER TABLE public.book_groups 
ADD COLUMN creator_name text;

-- Highlights table
ALTER TABLE public.highlights 
ADD COLUMN user_name text;

-- Community post replies table
ALTER TABLE public.community_post_replies 
ADD COLUMN user_name text;

-- Event messages table
ALTER TABLE public.event_messages 
ADD COLUMN user_name text;

-- Group messages table
ALTER TABLE public.group_messages 
ADD COLUMN user_name text;

-- Event RSVPs table
ALTER TABLE public.event_rsvps 
ADD COLUMN user_name text;

-- Group memberships table
ALTER TABLE public.group_memberships 
ADD COLUMN user_name text;

-- Reading challenges table
ALTER TABLE public.reading_challenges 
ADD COLUMN user_name text;

-- Create a function to get user's display name
CREATE OR REPLACE FUNCTION public.get_user_display_name(user_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  display_name text;
BEGIN
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