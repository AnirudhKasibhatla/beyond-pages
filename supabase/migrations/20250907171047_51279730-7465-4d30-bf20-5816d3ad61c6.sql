-- Create unique constraint on username column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_username_unique') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);
    END IF;
END $$;