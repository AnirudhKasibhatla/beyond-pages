-- Fix Event Data Exposure: Require authentication to view events
DROP POLICY IF EXISTS "Everyone can view events" ON public.book_events;
CREATE POLICY "Authenticated users can view events" 
ON public.book_events 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix Event Management: Allow event creators to view RSVPs for their events
CREATE POLICY "Event creators can view RSVPs for their events" 
ON public.event_rsvps 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = (SELECT creator_id FROM book_events WHERE id = event_id));

-- Fix Group Management: Allow group creators to view memberships for their groups
CREATE POLICY "Group creators can view memberships for their groups" 
ON public.group_memberships 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = (SELECT creator_id FROM book_groups WHERE id = group_id));