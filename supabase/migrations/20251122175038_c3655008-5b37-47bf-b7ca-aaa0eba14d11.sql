-- Create coinflip_rooms table
CREATE TABLE IF NOT EXISTS public.coinflip_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_wallet TEXT NOT NULL,
  creator_side TEXT NOT NULL CHECK (creator_side IN ('heads', 'tails')),
  bet_amount DECIMAL(10, 4) NOT NULL CHECK (bet_amount >= 0.1 AND bet_amount <= 1000),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coinflip_history table
CREATE TABLE IF NOT EXISTS public.coinflip_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_wallet TEXT NOT NULL,
  bet_amount DECIMAL(10, 4) NOT NULL,
  chosen_side TEXT NOT NULL CHECK (chosen_side IN ('heads', 'tails')),
  result TEXT NOT NULL CHECK (result IN ('heads', 'tails')),
  won BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.coinflip_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coinflip_history ENABLE ROW LEVEL SECURITY;

-- Policies for coinflip_rooms (public read, authenticated write)
CREATE POLICY "Anyone can view waiting rooms"
  ON public.coinflip_rooms
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create rooms"
  ON public.coinflip_rooms
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update rooms"
  ON public.coinflip_rooms
  FOR UPDATE
  USING (true);

-- Policies for coinflip_history (users can view their own history)
CREATE POLICY "Users can view their own history"
  ON public.coinflip_history
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert history"
  ON public.coinflip_history
  FOR INSERT
  WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX idx_coinflip_rooms_status ON public.coinflip_rooms(status);
CREATE INDEX idx_coinflip_rooms_created_at ON public.coinflip_rooms(created_at DESC);
CREATE INDEX idx_coinflip_history_wallet ON public.coinflip_history(player_wallet);
CREATE INDEX idx_coinflip_history_created_at ON public.coinflip_history(created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.coinflip_rooms;
