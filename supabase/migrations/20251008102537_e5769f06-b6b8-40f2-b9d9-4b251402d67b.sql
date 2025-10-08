-- Drop the restrictive policy for viewing other users' books
DROP POLICY IF EXISTS "Users can view read books with reviews from others" ON public.books;

-- Create a new policy that allows viewing all books from other users
CREATE POLICY "Users can view all books from others"
ON public.books
FOR SELECT
USING (user_id <> auth.uid());