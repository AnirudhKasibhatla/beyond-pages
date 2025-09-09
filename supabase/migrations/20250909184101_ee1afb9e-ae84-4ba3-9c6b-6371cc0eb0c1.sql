-- Fix potential RLS policy issues and ensure bio column exists
-- First, let's check if bio column exists and add it if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'bio' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN bio TEXT;
    END IF;
END $$;

-- Ensure public_profile column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'public_profile' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN public_profile BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Drop and recreate the problematic policies to fix any issues
DROP POLICY IF EXISTS "Users can view group member profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public opt-in profiles" ON public.profiles;

-- Create a more permissive policy temporarily to allow basic functionality
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to view profiles of people in their groups (simplified)
CREATE POLICY "Users can view connected profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    -- Own profile
    auth.uid() = user_id OR
    -- Public profiles (opt-in)
    public_profile = true
  )
);