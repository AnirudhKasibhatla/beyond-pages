-- Fix RLS policies by dropping all existing ones and recreating clean ones
-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view group member profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public opt-in profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view connected profiles" ON public.profiles;

-- Create clean, working policies
CREATE POLICY "profiles_select_own" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "profiles_select_public" 
ON public.profiles 
FOR SELECT 
USING (public_profile = true AND auth.uid() IS NOT NULL);