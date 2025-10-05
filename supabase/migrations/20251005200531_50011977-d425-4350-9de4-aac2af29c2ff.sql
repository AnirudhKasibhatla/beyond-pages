-- Add user_name column to books table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'books' 
    AND column_name = 'user_name'
  ) THEN
    ALTER TABLE public.books ADD COLUMN user_name text;
  END IF;
END $$;

-- Backfill user_name for existing books
UPDATE public.books b
SET user_name = p.name
FROM public.profiles p
WHERE b.user_id = p.user_id
AND b.user_name IS NULL;

-- Function to sync user_name when a book is inserted
CREATE OR REPLACE FUNCTION public.sync_book_user_name()
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
  
  -- Set the user_name on the book
  NEW.user_name := COALESCE(profile_name, 'Anonymous');
  
  RETURN NEW;
END;
$$;

-- Create trigger to sync user_name on book insert
DROP TRIGGER IF EXISTS trigger_sync_book_user_name ON public.books;
CREATE TRIGGER trigger_sync_book_user_name
BEFORE INSERT ON public.books
FOR EACH ROW
EXECUTE FUNCTION public.sync_book_user_name();

-- Function to update book user_names when profile name changes
CREATE OR REPLACE FUNCTION public.update_books_user_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update all books for this user when their name changes
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    UPDATE public.books
    SET user_name = NEW.name
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update books when profile name changes
DROP TRIGGER IF EXISTS trigger_update_books_user_name ON public.profiles;
CREATE TRIGGER trigger_update_books_user_name
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_books_user_name();