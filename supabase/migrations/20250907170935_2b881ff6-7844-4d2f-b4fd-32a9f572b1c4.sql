-- Add username column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
        ALTER TABLE public.profiles ADD COLUMN username text;
        
        -- Create unique constraint on username
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);
        
        -- Create index for better performance
        CREATE INDEX idx_profiles_username ON public.profiles(username);
    END IF;
END $$;