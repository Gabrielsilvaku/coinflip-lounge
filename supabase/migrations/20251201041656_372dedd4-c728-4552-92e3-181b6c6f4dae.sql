-- Configurar treasury (carteira da casa) com wallet address real
INSERT INTO treasury_config (wallet_address, house_edge_percent, referral_percent)
VALUES ('YOUR_TREASURY_WALLET_HERE', 3.5, 7)
ON CONFLICT (id) DO UPDATE 
SET house_edge_percent = 3.5, referral_percent = 7;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_jackpot_bets_round_id ON jackpot_bets(round_id);
CREATE INDEX IF NOT EXISTS idx_jackpot_bets_wallet ON jackpot_bets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_wallet);

-- Inserir rodada ativa de jackpot se não existir
INSERT INTO jackpot_rounds (status, total_pot, started_at)
SELECT 'active', 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM jackpot_rounds WHERE status = 'active');