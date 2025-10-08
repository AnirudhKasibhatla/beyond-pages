-- Function to check and award badges based on finished books count
CREATE OR REPLACE FUNCTION public.check_and_award_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  finished_count integer;
BEGIN
  -- Count finished books for this user
  SELECT COUNT(*) INTO finished_count
  FROM public.books
  WHERE user_id = NEW.user_id AND status = 'finished';

  -- Award "Starter" badge for 1 finished book
  IF finished_count >= 1 THEN
    INSERT INTO public.user_badges (user_id, badge_name)
    VALUES (NEW.user_id, 'Starter')
    ON CONFLICT (user_id, badge_name) DO NOTHING;
  END IF;

  -- Award "Library in making" badge for 10+ finished books
  IF finished_count >= 10 THEN
    INSERT INTO public.user_badges (user_id, badge_name)
    VALUES (NEW.user_id, 'Library in making')
    ON CONFLICT (user_id, badge_name) DO NOTHING;
  END IF;

  -- Award "Bibliophile" badge for 50+ finished books
  IF finished_count >= 50 THEN
    INSERT INTO public.user_badges (user_id, badge_name)
    VALUES (NEW.user_id, 'Bibliophile')
    ON CONFLICT (user_id, badge_name) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to check badges when books are inserted or updated
CREATE TRIGGER award_badges_on_book_change
AFTER INSERT OR UPDATE ON public.books
FOR EACH ROW
WHEN (NEW.status = 'finished')
EXECUTE FUNCTION public.check_and_award_badges();

-- Function to apply badges to existing users
CREATE OR REPLACE FUNCTION public.apply_badges_to_existing_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  finished_count integer;
BEGIN
  -- Loop through all users
  FOR user_record IN SELECT DISTINCT user_id FROM public.books
  LOOP
    -- Count finished books
    SELECT COUNT(*) INTO finished_count
    FROM public.books
    WHERE user_id = user_record.user_id AND status = 'finished';

    -- Award appropriate badges
    IF finished_count >= 1 THEN
      INSERT INTO public.user_badges (user_id, badge_name)
      VALUES (user_record.user_id, 'Starter')
      ON CONFLICT (user_id, badge_name) DO NOTHING;
    END IF;

    IF finished_count >= 10 THEN
      INSERT INTO public.user_badges (user_id, badge_name)
      VALUES (user_record.user_id, 'Library in making')
      ON CONFLICT (user_id, badge_name) DO NOTHING;
    END IF;

    IF finished_count >= 50 THEN
      INSERT INTO public.user_badges (user_id, badge_name)
      VALUES (user_record.user_id, 'Bibliophile')
      ON CONFLICT (user_id, badge_name) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

-- Add unique constraint to prevent duplicate badges
ALTER TABLE public.user_badges
ADD CONSTRAINT unique_user_badge UNIQUE (user_id, badge_name);

-- Apply badges to existing users
SELECT public.apply_badges_to_existing_users();