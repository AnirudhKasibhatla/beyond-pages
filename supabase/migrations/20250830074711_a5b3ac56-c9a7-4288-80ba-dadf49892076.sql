-- Fix search path for generate_username function
CREATE OR REPLACE FUNCTION public.generate_username(first_name_input text, last_name_input text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Update the handle_new_user function to use correct search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  generated_username text;
BEGIN
  -- Generate username from first and last name
  generated_username := generate_username(
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );

  INSERT INTO profiles (user_id, first_name, last_name, name, username)
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