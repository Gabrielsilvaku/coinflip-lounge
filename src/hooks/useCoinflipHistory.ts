import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HistoryItem {
  id: string;
  player_wallet: string;
  bet_amount: number;
  chosen_side: 'heads' | 'tails';
  result: 'heads' | 'tails';
  won: boolean;
  created_at: string;
}

export const useCoinflipHistory = (walletAddress: string | null) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setHistory([]);
      setLoading(false);
      return;
    }

    fetchHistory();
  }, [walletAddress]);

  const fetchHistory = async () => {
    if (!walletAddress) return;

    try {
      const { data, error } = await supabase
        .from('coinflip_history')
        .select('*')
        .eq('player_wallet', walletAddress)
        .order('created_at', { ascending: false})
        .limit(20);

      if (error) throw error;
      setHistory((data as HistoryItem[]) || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  return { history, loading };
};
