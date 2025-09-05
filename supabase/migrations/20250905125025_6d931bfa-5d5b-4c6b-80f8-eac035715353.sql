-- Create community_posts table
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  book_title TEXT,
  book_author TEXT,
  rating INTEGER,
  book_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  likes_count INTEGER NOT NULL DEFAULT 0,
  is_repost BOOLEAN NOT NULL DEFAULT false,
  original_post_id UUID
);

-- Create community_post_likes table
CREATE TABLE public.community_post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Create community_post_replies table
CREATE TABLE public.community_post_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_replies ENABLE ROW LEVEL SECURITY;

-- Create policies for community_posts
CREATE POLICY "Users can view all posts" 
ON public.community_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own posts" 
ON public.community_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.community_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.community_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for community_post_likes
CREATE POLICY "Users can view all likes" 
ON public.community_post_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own likes" 
ON public.community_post_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
ON public.community_post_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for community_post_replies
CREATE POLICY "Users can view all replies" 
ON public.community_post_replies 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own replies" 
ON public.community_post_replies 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replies" 
ON public.community_post_replies 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies" 
ON public.community_post_replies 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_community_posts_updated_at
BEFORE UPDATE ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_post_replies_updated_at
BEFORE UPDATE ON public.community_post_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update likes count
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for likes count updates
CREATE TRIGGER update_likes_count_trigger
AFTER INSERT OR DELETE ON public.community_post_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_likes_count();