-- Clear any existing test data
DELETE FROM highlights WHERE 1=1;

-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  status TEXT NOT NULL CHECK (status IN ('to-read', 'reading', 'finished')),
  genres TEXT[] DEFAULT '{}',
  progress TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create book_groups table
CREATE TABLE public.book_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  total_slots INTEGER NOT NULL CHECK (total_slots >= 2 AND total_slots <= 500),
  current_members INTEGER NOT NULL DEFAULT 1,
  type TEXT NOT NULL CHECK (type IN ('local', 'online', 'hybrid')),
  genre TEXT,
  privacy TEXT NOT NULL DEFAULT 'public' CHECK (privacy IN ('public', 'private')),
  current_book TEXT,
  activity_level TEXT NOT NULL DEFAULT 'moderate' CHECK (activity_level IN ('low', 'moderate', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create book_events table
CREATE TABLE public.book_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('virtual', 'in-person', 'hybrid')),
  category TEXT NOT NULL CHECK (category IN ('book-club', 'author-talk', 'workshop', 'social')),
  max_attendees INTEGER,
  host_xp INTEGER NOT NULL DEFAULT 15,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_rsvps table
CREATE TABLE public.event_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.book_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create group_memberships table
CREATE TABLE public.group_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.book_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for books
CREATE POLICY "Users can view their own books" ON public.books FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own books" ON public.books FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own books" ON public.books FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own books" ON public.books FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for book groups (viewable by all, manageable by creator)
CREATE POLICY "Everyone can view public groups" ON public.book_groups FOR SELECT USING (privacy = 'public');
CREATE POLICY "Users can create groups" ON public.book_groups FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update their groups" ON public.book_groups FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete their groups" ON public.book_groups FOR DELETE USING (auth.uid() = creator_id);

-- Create RLS policies for book events (viewable by all, manageable by creator)
CREATE POLICY "Everyone can view events" ON public.book_events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON public.book_events FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update their events" ON public.book_events FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete their events" ON public.book_events FOR DELETE USING (auth.uid() = creator_id);

-- Create RLS policies for event RSVPs
CREATE POLICY "Users can view their own RSVPs" ON public.event_rsvps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own RSVPs" ON public.event_rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own RSVPs" ON public.event_rsvps FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for group memberships
CREATE POLICY "Users can view their own memberships" ON public.group_memberships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own memberships" ON public.group_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own memberships" ON public.group_memberships FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_book_groups_updated_at BEFORE UPDATE ON public.book_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_book_events_updated_at BEFORE UPDATE ON public.book_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();