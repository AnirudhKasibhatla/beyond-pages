-- Update RLS policies to allow public viewing of events and event details

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view events" ON public.book_events;
DROP POLICY IF EXISTS "Authenticated users can view event details" ON public.event_details;

-- Create new public viewing policies for events
CREATE POLICY "Everyone can view events" 
ON public.book_events 
FOR SELECT 
USING (true);

-- Create new public viewing policy for event details
CREATE POLICY "Everyone can view event details" 
ON public.event_details 
FOR SELECT 
USING (true);

-- Ensure event images are publicly viewable (already exists but confirming)
-- The policy "Anyone can view event images" already allows public access

-- Note: RSVP creation and group membership creation still require authentication
-- via existing policies that check auth.uid() = user_id