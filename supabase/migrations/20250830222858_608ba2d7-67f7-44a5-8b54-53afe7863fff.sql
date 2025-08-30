-- Fix conflicting RLS policies on profiles table
-- Remove the conflicting "Deny public access to profiles" policy and redundant policies
-- Keep only clear, specific policies for each operation

-- Drop conflicting and redundant policies
DROP POLICY IF EXISTS "Deny public access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users only" ON public.profiles;

-- Ensure we have clear, specific policies for each operation
-- These policies ensure only authenticated users can access their own profile data

-- Allow users to view only their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to insert only their own profile  
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to delete only their own profile
CREATE POLICY "Users can delete own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);