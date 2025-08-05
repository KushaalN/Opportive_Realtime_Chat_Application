-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create conversation_participants table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(conversation_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  message_type text DEFAULT 'text' NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_status table for online/offline status
CREATE TABLE IF NOT EXISTS public.user_status (
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  status text DEFAULT 'offline' NOT NULL CHECK (status IN ('online', 'offline', 'away')),
  last_seen timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create policies for conversations
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations"
ON public.conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversations.id
  )
);

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (true);

-- Create policies for conversation_participants
DROP POLICY IF EXISTS "Users can view conversation participants" ON public.conversation_participants;
CREATE POLICY "Users can view conversation participants"
ON public.conversation_participants FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can add participants" ON public.conversation_participants;
CREATE POLICY "Users can add participants"
ON public.conversation_participants FOR INSERT
WITH CHECK (true);

-- Create policies for messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
  )
);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (true);

-- Create policies for user_status
DROP POLICY IF EXISTS "Users can view all user statuses" ON public.user_status;
CREATE POLICY "Users can view all user statuses"
ON public.user_status FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can update their own status" ON public.user_status;
CREATE POLICY "Users can update their own status"
ON public.user_status FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their status" ON public.user_status;
CREATE POLICY "Users can update their status"
ON public.user_status FOR UPDATE
USING (true);

-- Enable realtime for all chat tables
alter publication supabase_realtime add table conversations;
alter publication supabase_realtime add table conversation_participants;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table user_status;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
