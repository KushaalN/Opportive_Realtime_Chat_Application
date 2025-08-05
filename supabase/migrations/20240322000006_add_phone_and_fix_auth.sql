-- Add phone number, password, and gender fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_number text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gender text DEFAULT 'male';

-- Create a policy for username lookups (needed for login)
DROP POLICY IF EXISTS "Allow username lookup for authentication" ON public.users;
CREATE POLICY "Allow username lookup for authentication"
ON public.users FOR SELECT
USING (true);

-- Create a policy for user registration
DROP POLICY IF EXISTS "Allow user registration" ON public.users;
CREATE POLICY "Allow user registration"
ON public.users FOR INSERT
WITH CHECK (true);

-- Create a policy for user updates
DROP POLICY IF EXISTS "Allow user updates" ON public.users;
CREATE POLICY "Allow user updates"
ON public.users FOR UPDATE
USING (true);

-- Enable realtime for users table (only if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE users;
  END IF;
END $$;