-- Add additional profile fields for user details
ALTER TABLE public.profiles 
ADD COLUMN name text,
ADD COLUMN country text, 
ADD COLUMN date_of_birth date,
ADD COLUMN email text,
ADD COLUMN phone text;