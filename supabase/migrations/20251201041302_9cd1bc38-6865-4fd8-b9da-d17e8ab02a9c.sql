-- ====================================
-- NEW TABLES FOR ENHANCED FEATURES
-- (Preserving ALL existing tables)
-- ====================================

-- User wallet management
CREATE TABLE IF NOT EXISTS wallet_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transformations / Auras system
CREATE TABLE IF NOT EXISTS transformations (
  id SERIAL PRIMARY KEY,
  level_required INT NOT NULL,
  name TEXT NOT NULL,
  aura_color TEXT NOT NULL,
  aura_effect TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert all Dragon Ball transformations
INSERT INTO transformations (level_required, name, aura_color, aura_effect, description) VALUES
(0, 'Base Form', '#808080', 'none', 'Forma base'),
(10, 'SSJ1', '#FFD700', 'golden-glow', 'Super Saiyan 1'),
(20, 'SSJ2', '#FFD700', 'golden-sparks', 'Super Saiyan 2'),
(30, 'SSJ3', '#FFD700', 'golden-intense', 'Super Saiyan 3'),
(30, 'Majin Vegeta', '#FF6B35', 'demonic-aura', 'Prince Majin Vegeta'),
(30, 'Mystic', '#FFFFFF', 'mystic-white', 'Mystic Form'),
(40, 'SSJ4', '#DC143C', 'red-primal', 'Super Saiyan 4'),
(50, 'SSJ God', '#FF0000', 'divine-red', 'Super Saiyan God'),
(60, 'SSJ Blue', '#00BFFF', 'blue-divine', 'Super Saiyan Blue'),
(70, 'SSJ Blue KKx20', '#00BFFF', 'blue-red-mix', 'SSJ Blue Kaioken x20'),
(70, 'SSJ Blue Evolved', '#0000CD', 'evolved-blue', 'SSJ Blue Evolution'),
(80, 'Ultra Instinct Omen', '#C0C0C0', 'silver-calm', 'Ultra Instinct Omen'),
(90, 'Ultra Instinct', '#F0F0F0', 'mastered-silver', 'Ultra Instinct Mastered'),
(90, 'Ultra Ego', '#9932CC', 'purple-destruction', 'Ultra Ego'),
(95, 'Beast Form', '#FFB6C1', 'beast-pink', 'Beast Mode'),
(98, 'Orange Piccolo', '#FF8C00', 'orange-flames', 'Orange Piccolo'),
(100, 'God of Destruction', '#8B008B', 'hakai-purple', 'God of Destruction')
ON CONFLICT DO NOTHING;

-- User levels and XP
CREATE TABLE IF NOT EXISTS user_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  level INT DEFAULT 0,
  xp BIGINT DEFAULT 0,
  total_wagered NUMERIC DEFAULT 0,
  current_transformation TEXT DEFAULT 'Base Form',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- XP activity logs
CREATE TABLE IF NOT EXISTS xp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  xp_gained BIGINT NOT NULL,
  source TEXT NOT NULL,
  amount_wagered NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jackpot rounds
CREATE TABLE IF NOT EXISTS jackpot_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_number SERIAL,
  total_pot NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  winner_wallet TEXT,
  winner_ticket_number INT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Jackpot entries
CREATE TABLE IF NOT EXISTS jackpot_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES jackpot_rounds(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  ticket_start INT NOT NULL,
  ticket_end INT NOT NULL,
  transaction_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Single raffle system
CREATE TABLE IF NOT EXISTS raffle_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prize_amount NUMERIC NOT NULL,
  ticket_price NUMERIC NOT NULL,
  status TEXT DEFAULT 'active',
  winner_wallet TEXT,
  winner_ticket INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Insert default raffle
INSERT INTO raffle_config (prize_amount, ticket_price, status)
VALUES (2000, 0.001, 'active')
ON CONFLICT DO NOTHING;

-- Raffle ticket purchases
CREATE TABLE IF NOT EXISTS raffle_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  ticket_number INT NOT NULL,
  amount_paid NUMERIC NOT NULL,
  transaction_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral system
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_wallet TEXT NOT NULL,
  referee_wallet TEXT NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  total_earned NUMERIC DEFAULT 0,
  fraud_detected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral earnings log
CREATE TABLE IF NOT EXISTS referral_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID REFERENCES referrals(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  source TEXT NOT NULL,
  transaction_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin access control (fixing security issue)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Treasury wallet configuration
CREATE TABLE IF NOT EXISTS treasury_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  house_edge_percent NUMERIC DEFAULT 3.5,
  referral_percent NUMERIC DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert treasury wallet
INSERT INTO treasury_config (wallet_address, house_edge_percent, referral_percent)
VALUES ('4uNhT1fDwJg62gYbT7sSfJ4Qmwp7XAGSVCoEMUUoHktU', 3.5, 7)
ON CONFLICT DO NOTHING;

-- ====================================
-- RLS POLICIES
-- ====================================

-- Enable RLS on all new tables
ALTER TABLE wallet_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE transformations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE jackpot_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE jackpot_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_config ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can view transformations" ON transformations FOR SELECT USING (true);
CREATE POLICY "Anyone can view user XP" ON user_xp FOR SELECT USING (true);
CREATE POLICY "Anyone can view jackpot rounds" ON jackpot_rounds FOR SELECT USING (true);
CREATE POLICY "Anyone can view jackpot bets" ON jackpot_bets FOR SELECT USING (true);
CREATE POLICY "Anyone can view raffle config" ON raffle_config FOR SELECT USING (true);
CREATE POLICY "Anyone can view raffle purchases" ON raffle_purchases FOR SELECT USING (true);
CREATE POLICY "Anyone can view treasury config" ON treasury_config FOR SELECT USING (true);

-- Service role only write policies (for Edge Functions)
CREATE POLICY "Service role can manage user XP" ON user_xp FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage XP logs" ON xp_logs FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage jackpot rounds" ON jackpot_rounds FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage jackpot bets" ON jackpot_bets FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage raffle" ON raffle_config FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage raffle purchases" ON raffle_purchases FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage referrals" ON referrals FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage referral earnings" ON referral_earnings FOR ALL TO service_role USING (true);

-- Admin policies
CREATE POLICY "Only admins can view admin users" ON admin_users FOR SELECT 
USING (EXISTS (SELECT 1 FROM admin_users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'));

CREATE POLICY "Only admins can manage support tickets" ON support_tickets FOR ALL
USING (EXISTS (SELECT 1 FROM admin_users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'));

CREATE POLICY "Users can create support tickets" ON support_tickets FOR INSERT WITH CHECK (true);

-- ====================================
-- REALTIME PUBLICATIONS
-- ====================================

ALTER PUBLICATION supabase_realtime ADD TABLE jackpot_rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE jackpot_bets;
ALTER PUBLICATION supabase_realtime ADD TABLE raffle_purchases;
ALTER PUBLICATION supabase_realtime ADD TABLE user_xp;