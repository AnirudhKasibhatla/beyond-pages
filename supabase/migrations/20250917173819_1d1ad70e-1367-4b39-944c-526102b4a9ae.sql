-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-images', 'event-images', true);

-- Create table to store event image references
CREATE TABLE public.event_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES book_events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on event_images table
ALTER TABLE public.event_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for event_images
CREATE POLICY "Anyone can view event images" 
ON public.event_images 
FOR SELECT 
USING (true);

CREATE POLICY "Event creators can create images" 
ON public.event_images 
FOR INSERT 
WITH CHECK (
  auth.uid() = (
    SELECT creator_id 
    FROM book_events 
    WHERE id = event_images.event_id
  )
);

CREATE POLICY "Event creators can delete images" 
ON public.event_images 
FOR DELETE 
USING (
  auth.uid() = (
    SELECT creator_id 
    FROM book_events 
    WHERE id = event_images.event_id
  )
);

-- Create storage policies for event images
CREATE POLICY "Anyone can view event images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated users can upload event images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'event-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Event creators can delete their images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'event-images' 
  AND auth.uid() IS NOT NULL
);