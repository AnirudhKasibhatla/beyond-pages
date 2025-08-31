-- Create highlight_follows table for following highlights
CREATE TABLE public.highlight_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  highlight_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, highlight_id)
);

-- Enable RLS on highlight_follows
ALTER TABLE public.highlight_follows ENABLE ROW LEVEL SECURITY;

-- Create policies for highlight_follows
CREATE POLICY "Users can view their own follows" 
ON public.highlight_follows 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own follows" 
ON public.highlight_follows 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own follows" 
ON public.highlight_follows 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_highlight_follows_user_id ON public.highlight_follows(user_id);
CREATE INDEX idx_highlight_follows_highlight_id ON public.highlight_follows(highlight_id);