-- Add recurring event fields to book_events table
ALTER TABLE public.book_events 
ADD COLUMN recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN recurring_days TEXT[], -- Array of days like ['monday', 'tuesday']
ADD COLUMN recurring_duration INTEGER; -- Number of weeks to repeat

-- Add additional event details fields
ALTER TABLE public.book_events 
ADD COLUMN image_url TEXT,
ADD COLUMN host_bio TEXT,
ADD COLUMN additional_info TEXT;

-- Add additional group details fields  
ALTER TABLE public.book_groups
ADD COLUMN image_url TEXT,
ADD COLUMN additional_info TEXT,
ADD COLUMN book_cover_url TEXT;

-- Create event_details table for extended event information
CREATE TABLE public.event_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.book_events(id) ON DELETE CASCADE,
  host_bio TEXT,
  additional_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on event_details
ALTER TABLE public.event_details ENABLE ROW LEVEL SECURITY;

-- Create policies for event_details
CREATE POLICY "Authenticated users can view event details" 
ON public.event_details 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Event creators can create event details" 
ON public.event_details 
FOR INSERT 
WITH CHECK (auth.uid() = (
  SELECT creator_id FROM public.book_events WHERE id = event_details.event_id
));

CREATE POLICY "Event creators can update event details" 
ON public.event_details 
FOR UPDATE 
USING (auth.uid() = (
  SELECT creator_id FROM public.book_events WHERE id = event_details.event_id
));

-- Create group_details table for extended group information
CREATE TABLE public.group_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.book_groups(id) ON DELETE CASCADE,
  additional_details TEXT,
  book_covers TEXT[], -- Array of book cover URLs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on group_details
ALTER TABLE public.group_details ENABLE ROW LEVEL SECURITY;

-- Create policies for group_details
CREATE POLICY "Everyone can view public group details" 
ON public.group_details 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.book_groups bg 
  WHERE bg.id = group_details.group_id AND bg.privacy = 'public'
));

CREATE POLICY "Group creators can create group details" 
ON public.group_details 
FOR INSERT 
WITH CHECK (auth.uid() = (
  SELECT creator_id FROM public.book_groups WHERE id = group_details.group_id
));

CREATE POLICY "Group creators can update group details" 
ON public.group_details 
FOR UPDATE 
USING (auth.uid() = (
  SELECT creator_id FROM public.book_groups WHERE id = group_details.group_id
));

-- Add triggers for updated_at
CREATE TRIGGER update_event_details_updated_at
  BEFORE UPDATE ON public.event_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_details_updated_at
  BEFORE UPDATE ON public.group_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();