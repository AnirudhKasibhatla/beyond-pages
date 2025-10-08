-- Update RLS policies to allow viewing any book for book details page
-- This is needed because book detail pages should be publicly viewable

DROP POLICY IF EXISTS "Users can view all books from others" ON books;
DROP POLICY IF EXISTS "Users can view their own books" ON books;

-- Create a single policy that allows anyone to view any book
CREATE POLICY "Anyone can view all books"
ON books
FOR SELECT
USING (true);

-- Keep the existing policies for create, update, delete unchanged
-- (Users can only modify their own books)