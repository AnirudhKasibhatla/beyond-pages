-- Add storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-pictures', 'profile-pictures', true);

-- Create storage policies for profile pictures
CREATE POLICY "Profile pictures are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload their own profile picture" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile picture" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile picture" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add profile_picture_url column to profiles table
ALTER TABLE profiles ADD COLUMN profile_picture_url TEXT;

-- Update the generate_username function to create 10-character random usernames
CREATE OR REPLACE FUNCTION public.generate_username(first_name_input text DEFAULT '', last_name_input text DEFAULT '')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  base_username text;
  final_username text;
  counter integer := 1;
  chars text := 'abcdefghijklmnopqrstuvwxyz0123456789';
  random_username text := '';
  i integer;
BEGIN
  -- If names are provided, try to create username from them first
  IF first_name_input != '' OR last_name_input != '' THEN
    base_username := lower(trim(coalesce(first_name_input, '') || coalesce(last_name_input, '')));
    base_username := regexp_replace(base_username, '[^a-z0-9]', '', 'g');
    
    IF base_username != '' THEN
      final_username := base_username;
      
      -- Check if username exists and add numbers if needed
      WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
        final_username := base_username || counter::text;
        counter := counter + 1;
      END LOOP;
      
      RETURN final_username;
    END IF;
  END IF;
  
  -- Generate random 10-character username
  FOR i IN 1..10 LOOP
    random_username := random_username || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = random_username) LOOP
    random_username := '';
    FOR i IN 1..10 LOOP
      random_username := random_username || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
  END LOOP;
  
  RETURN random_username;
END;
$function$;

-- Create function to check username availability
CREATE OR REPLACE FUNCTION public.check_username_availability(username_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = username_input);
END;
$function$;

-- Update profiles table to view other users' profiles
-- Add a new RLS policy for viewing public profiles
CREATE POLICY "Users can view public profiles" 
ON public.profiles 
FOR SELECT 
USING (true); -- Allow everyone to view profiles