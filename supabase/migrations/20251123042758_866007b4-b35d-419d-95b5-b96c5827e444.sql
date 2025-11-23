-- Create chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read chat messages"
  ON public.chat_messages
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert chat messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Add joiner_wallet to coinflip_rooms
ALTER TABLE public.coinflip_rooms ADD COLUMN IF NOT EXISTS joiner_wallet TEXT;
ALTER TABLE public.coinflip_rooms ADD COLUMN IF NOT EXISTS result TEXT;
ALTER TABLE public.coinflip_rooms ADD COLUMN IF NOT EXISTS winner_wallet TEXT;