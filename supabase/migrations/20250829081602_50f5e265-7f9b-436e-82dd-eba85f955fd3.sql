-- Add explicit deny policy for public access to profiles table
-- This ensures no unauthorized access to sensitive personal data

-- First, let's add a restrictive policy that explicitly denies public access
CREATE POLICY "Deny public access to profiles" 
ON public.profiles 
FOR ALL 
TO anon 
USING (false);

-- Also add a policy to ensure only authenticated users can even attempt access
CREATE POLICY "Authenticated users only" 
ON public.profiles 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

-- Drop the existing less restrictive policies and replace with more secure ones
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create new, more explicit policies for authenticated users only
CREATE POLICY "Authenticated users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Ensure the user_id column cannot be null to prevent security bypasses
ALTER TABLE public.profiles 
ALTER COLUMN user_id SET NOT NULL;