-- Add unique constraint to username column
ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);

-- Create index for better performance on username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
