-- Function to create a post when a user adds a book
CREATE OR REPLACE FUNCTION public.create_post_on_book_added()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create post for new books with 'read' or 'reading' status
  IF NEW.status IN ('read', 'reading') THEN
    INSERT INTO public.community_posts (user_id, content, book_title, book_author, rating, book_id)
    VALUES (
      NEW.user_id,
      CASE 
        WHEN NEW.status = 'read' AND NEW.rating IS NOT NULL THEN 
          'Just finished reading this book and rated it ' || NEW.rating || ' stars!'
        WHEN NEW.status = 'read' THEN 
          'Just finished reading this book!'
        ELSE 
          'Started reading this book!'
      END,
      NEW.title,
      NEW.author,
      NEW.rating,
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Function to create a post when a user updates a book rating
CREATE OR REPLACE FUNCTION public.create_post_on_rating_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only post if rating changed and book is marked as read
  IF NEW.rating IS DISTINCT FROM OLD.rating AND NEW.rating IS NOT NULL AND NEW.status = 'read' THEN
    INSERT INTO public.community_posts (user_id, content, book_title, book_author, rating, book_id)
    VALUES (
      NEW.user_id,
      'Updated rating for this book to ' || NEW.rating || ' stars!',
      NEW.title,
      NEW.author,
      NEW.rating,
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Function to create a post when a user hosts an event
CREATE OR REPLACE FUNCTION public.create_post_on_event_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.community_posts (user_id, content)
  VALUES (
    NEW.creator_id,
    'Hosting a new ' || NEW.type || ' event: "' || NEW.title || '"! Join us on ' || NEW.event_date::text || ' at ' || NEW.event_time || ' in ' || NEW.location || '.'
  );
  RETURN NEW;
END;
$$;

-- Function to create a post when a user RSVPs to an event
CREATE OR REPLACE FUNCTION public.create_post_on_event_rsvp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_title text;
  event_type text;
BEGIN
  -- Get event details
  SELECT title, type INTO event_title, event_type
  FROM public.book_events
  WHERE id = NEW.event_id;

  INSERT INTO public.community_posts (user_id, content)
  VALUES (
    NEW.user_id,
    'RSVP''d to the ' || event_type || ' event: "' || event_title || '"!'
  );
  RETURN NEW;
END;
$$;

-- Function to create a post when a user joins a group
CREATE OR REPLACE FUNCTION public.create_post_on_group_joined()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  group_name text;
BEGIN
  -- Get group name
  SELECT name INTO group_name
  FROM public.book_groups
  WHERE id = NEW.group_id;

  INSERT INTO public.community_posts (user_id, content)
  VALUES (
    NEW.user_id,
    'Joined the book group: "' || group_name || '"!'
  );
  RETURN NEW;
END;
$$;

-- Function to create a post when a user adds a highlight/quote
CREATE OR REPLACE FUNCTION public.create_post_on_highlight_added()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.community_posts (user_id, content, book_title, book_author)
  VALUES (
    NEW.user_id,
    'Highlighted a quote from this book: "' || 
    CASE 
      WHEN LENGTH(NEW.quote_text) > 150 THEN SUBSTRING(NEW.quote_text, 1, 150) || '...'
      ELSE NEW.quote_text
    END || '"',
    NEW.book_title,
    NEW.book_author
  );
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER trigger_post_on_book_added
AFTER INSERT ON public.books
FOR EACH ROW
EXECUTE FUNCTION public.create_post_on_book_added();

CREATE TRIGGER trigger_post_on_rating_updated
AFTER UPDATE ON public.books
FOR EACH ROW
EXECUTE FUNCTION public.create_post_on_rating_updated();

CREATE TRIGGER trigger_post_on_event_created
AFTER INSERT ON public.book_events
FOR EACH ROW
EXECUTE FUNCTION public.create_post_on_event_created();

CREATE TRIGGER trigger_post_on_event_rsvp
AFTER INSERT ON public.event_rsvps
FOR EACH ROW
EXECUTE FUNCTION public.create_post_on_event_rsvp();

CREATE TRIGGER trigger_post_on_group_joined
AFTER INSERT ON public.group_memberships
FOR EACH ROW
EXECUTE FUNCTION public.create_post_on_group_joined();

CREATE TRIGGER trigger_post_on_highlight_added
AFTER INSERT ON public.highlights
FOR EACH ROW
EXECUTE FUNCTION public.create_post_on_highlight_added();