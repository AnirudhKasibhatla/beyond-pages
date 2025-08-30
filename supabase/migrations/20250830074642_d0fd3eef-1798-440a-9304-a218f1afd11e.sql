-- Add username to profiles table
ALTER TABLE public.profiles 
ADD COLUMN username text UNIQUE;

-- Create reading challenges table
CREATE TABLE public.reading_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year integer NOT NULL,
  goal integer NOT NULL DEFAULT 12,
  completed integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'failed')),
  best_month text DEFAULT 'No data',
  favorite_genre text DEFAULT 'No data',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, year)
);

-- Enable RLS on reading challenges
ALTER TABLE public.reading_challenges ENABLE ROW LEVEL SECURITY;

-- Create policies for reading challenges
CREATE POLICY "Users can view their own challenges" 
ON public.reading_challenges 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own challenges" 
ON public.reading_challenges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges" 
ON public.reading_challenges 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenges" 
ON public.reading_challenges 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates on challenges
CREATE TRIGGER update_reading_challenges_updated_at
BEFORE UPDATE ON public.reading_challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add function to generate username from first and last name
CREATE OR REPLACE FUNCTION public.generate_username(first_name_input text, last_name_input text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_username text;
  final_username text;
  counter integer := 1;
BEGIN
  -- Create base username by combining first and last name in lowercase without spaces
  base_username := lower(trim(coalesce(first_name_input, '') || coalesce(last_name_input, '')));
  
  -- Remove any non-alphanumeric characters except numbers
  base_username := regexp_replace(base_username, '[^a-z0-9]', '', 'g');
  
  -- If empty, use 'user' as default
  IF base_username = '' THEN
    base_username := 'user';
  END IF;
  
  final_username := base_username;
  
  -- Check if username exists and add numbers if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    final_username := base_username || counter::text;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_username;
END;
$$;

-- Update the handle_new_user function to generate username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  generated_username text;
BEGIN
  -- Generate username from first and last name
  generated_username := public.generate_username(
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );

  INSERT INTO public.profiles (user_id, first_name, last_name, name, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    generated_username
  )
  ON CONFLICT (user_id) DO UPDATE SET
    first_name = COALESCE(NEW.raw_user_meta_data ->> 'first_name', profiles.first_name),
    last_name = COALESCE(NEW.raw_user_meta_data ->> 'last_name', profiles.last_name),
    name = COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email, profiles.name),
    username = COALESCE(profiles.username, generated_username);
  RETURN NEW;
END;
$function$