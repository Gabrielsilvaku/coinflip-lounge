import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserStats {
  total_bets: number;
  total_wagered: number;
  total_won: number;
  total_lost: number;
  coinflip_wins: number;
  coinflip_losses: number;
  jackpot_participations: number;
  jackpot_wins: number;
}

export const useUserStats = (walletAddress: string | null) => {
  const [stats, setStats] = useState<UserStats>({
    total_bets: 0,
    total_wagered: 0,
    total_won: 0,
    total_lost: 0,
    coinflip_wins: 0,
    coinflip_losses: 0,
    jackpot_participations: 0,
    jackpot_wins: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }

    fetchStats();

    // Subscribe to real-time updates
    const coinflipChannel = supabase
      .channel(`stats_coinflip_${walletAddress}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coinflip_history',
          filter: `player_wallet=eq.${walletAddress}`
        },
        () => fetchStats()
      )
      .subscribe();

    const jackpotChannel = supabase
      .channel(`stats_jackpot_${walletAddress}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jackpot_bets',
          filter: `wallet_address=eq.${walletAddress}`
        },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(coinflipChannel);
      supabase.removeChannel(jackpotChannel);
    };
  }, [walletAddress]);

  const fetchStats = async () => {
    if (!walletAddress) return;

    try {
      // Fetch coinflip history
      const { data: coinflipData } = await supabase
        .from('coinflip_history')
        .select('*')
        .eq('player_wallet', walletAddress);

      // Fetch jackpot bets
      const { data: jackpotBetsData } = await supabase
        .from('jackpot_bets')
        .select('*')
        .eq('wallet_address', walletAddress);

      // Fetch jackpot wins
      const { data: jackpotWinsData } = await supabase
        .from('jackpot_rounds')
        .select('*')
        .eq('winner_wallet', walletAddress)
        .eq('status', 'completed');

      const coinflipWins = coinflipData?.filter(c => c.won).length || 0;
      const coinflipLosses = coinflipData?.filter(c => !c.won).length || 0;
      
      const coinflipWagered = coinflipData?.reduce((sum, c) => sum + Number(c.bet_amount), 0) || 0;
      const coinflipWon = coinflipData?.filter(c => c.won).reduce((sum, c) => sum + Number(c.bet_amount) * 2, 0) || 0;
      const coinflipLost = coinflipData?.filter(c => !c.won).reduce((sum, c) => sum + Number(c.bet_amount), 0) || 0;

      const jackpotWagered = jackpotBetsData?.reduce((sum, b) => sum + Number(b.amount), 0) || 0;
      const jackpotWon = jackpotWinsData?.reduce((sum, w) => sum + Number(w.total_pot), 0) || 0;

      setStats({
        total_bets: (coinflipData?.length || 0) + (jackpotBetsData?.length || 0),
        total_wagered: coinflipWagered + jackpotWagered,
        total_won: coinflipWon + jackpotWon,
        total_lost: coinflipLost,
        coinflip_wins: coinflipWins,
        coinflip_losses: coinflipLosses,
        jackpot_participations: jackpotBetsData?.length || 0,
        jackpot_wins: jackpotWinsData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading };
};
