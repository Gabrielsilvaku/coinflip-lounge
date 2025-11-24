-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Anyone can view roles"
ON public.user_roles
FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create banned_users table
CREATE TABLE public.banned_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  ip_address TEXT,
  banned_by UUID REFERENCES auth.users(id),
  reason TEXT,
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (wallet_address)
);

ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can check if banned"
ON public.banned_users
FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage bans"
ON public.banned_users
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create muted_users table
CREATE TABLE public.muted_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  muted_by UUID REFERENCES auth.users(id),
  reason TEXT,
  muted_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (wallet_address)
);

ALTER TABLE public.muted_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can check if muted"
ON public.muted_users
FOR SELECT
USING (true);

CREATE POLICY "Admins and moderators can manage mutes"
ON public.muted_users
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

-- Create user_levels table (sistema DBZ)
CREATE TABLE public.user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  level INTEGER DEFAULT 0 CHECK (level >= 0 AND level <= 100),
  xp NUMERIC DEFAULT 0,
  total_wagered NUMERIC DEFAULT 0,
  transformation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view levels"
ON public.user_levels
FOR SELECT
USING (true);

CREATE POLICY "Users can update their own level"
ON public.user_levels
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update levels"
ON public.user_levels
FOR UPDATE
USING (true);

-- Create raffle_tickets table
CREATE TABLE public.raffle_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  ticket_number INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  raffle_id TEXT DEFAULT 'main',
  UNIQUE (raffle_id, ticket_number)
);

ALTER TABLE public.raffle_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tickets"
ON public.raffle_tickets
FOR SELECT
USING (true);

CREATE POLICY "Anyone can buy tickets"
ON public.raffle_tickets
FOR INSERT
WITH CHECK (true);

-- Create raffle_winners table
CREATE TABLE public.raffle_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  ticket_number INTEGER NOT NULL,
  raffle_id TEXT DEFAULT 'main',
  selected_by UUID REFERENCES auth.users(id),
  won_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.raffle_winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view winners"
ON public.raffle_winners
FOR SELECT
USING (true);

CREATE POLICY "Only admins can select winners"
ON public.raffle_winners
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create game_settings table
CREATE TABLE public.game_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.game_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings"
ON public.game_settings
FOR SELECT
USING (true);

CREATE POLICY "Only admins can update settings"
ON public.game_settings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default house edge
INSERT INTO public.game_settings (setting_key, setting_value)
VALUES ('house_edge', '3.5');

-- Create action_logs table
CREATE TABLE public.action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  target_wallet TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.action_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view logs"
ON public.action_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert logs"
ON public.action_logs
FOR INSERT
WITH CHECK (true);

-- Enable realtime for necessary tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_levels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.raffle_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.raffle_winners;
ALTER PUBLICATION supabase_realtime ADD TABLE public.banned_users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.muted_users;