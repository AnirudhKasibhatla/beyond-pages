-- Create chat tables for groups and events
CREATE TABLE public.group_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.book_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'message' CHECK (message_type IN ('message', 'post')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.event_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.book_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'message' CHECK (message_type IN ('message', 'post')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for group messages
CREATE POLICY "Group members can view messages"
ON public.group_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_memberships gm
    WHERE gm.group_id = group_messages.group_id 
    AND gm.user_id = auth.uid()
  ) OR 
  auth.uid() = (
    SELECT creator_id FROM public.book_groups 
    WHERE id = group_messages.group_id
  )
);

CREATE POLICY "Group members can create messages"
ON public.group_messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND (
    EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = group_messages.group_id 
      AND gm.user_id = auth.uid()
    ) OR 
    auth.uid() = (
      SELECT creator_id FROM public.book_groups 
      WHERE id = group_messages.group_id
    )
  )
);

CREATE POLICY "Users can update their own messages"
ON public.group_messages
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
ON public.group_messages
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for event messages
CREATE POLICY "Event attendees can view messages"
ON public.event_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.event_rsvps er
    WHERE er.event_id = event_messages.event_id 
    AND er.user_id = auth.uid()
  ) OR 
  auth.uid() = (
    SELECT creator_id FROM public.book_events 
    WHERE id = event_messages.event_id
  )
);

CREATE POLICY "Event attendees can create messages"
ON public.event_messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND (
    EXISTS (
      SELECT 1 FROM public.event_rsvps er
      WHERE er.event_id = event_messages.event_id 
      AND er.user_id = auth.uid()
    ) OR 
    auth.uid() = (
      SELECT creator_id FROM public.book_events 
      WHERE id = event_messages.event_id
    )
  )
);

CREATE POLICY "Users can update their own event messages"
ON public.event_messages
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own event messages"
ON public.event_messages
FOR DELETE
USING (auth.uid() = user_id);