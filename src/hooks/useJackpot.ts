import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface JackpotBet {
  id: string;
  wallet_address: string;
  amount: number;
  ticket_start: number;
  ticket_end: number;
  created_at: string;
}

interface JackpotRound {
  id: string;
  round_number: number;
  total_pot: number;
  status: string;
  started_at: string;
  winner_wallet: string | null;
  winner_ticket_number: number | null;
  completed_at: string | null;
}

export const useJackpot = () => {
  const [currentRound, setCurrentRound] = useState<JackpotRound | null>(null);
  const [bets, setBets] = useState<JackpotBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastWinner, setLastWinner] = useState<JackpotRound | null>(null);

  // Fetch active round
  const fetchRound = async () => {
    try {
      const { data, error } = await supabase
        .from('jackpot_rounds')
        .select('*')
        .eq('status', 'active')
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setCurrentRound(data as JackpotRound);
        
        // Calculate time left
        const startTime = new Date(data.started_at).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        const remaining = Math.max(0, 60 - elapsed);
        setTimeLeft(remaining);
      }
      
      // Fetch last winner
      const { data: winnerData } = await supabase
        .from('jackpot_rounds')
        .select('*')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (winnerData) {
        setLastWinner(winnerData as JackpotRound);
      }
      
      if (!data) {
        // Create new round if none exists
        await createNewRound();
      }
    } catch (error) {
      console.error('Error fetching round:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bets for current round
  const fetchBets = async () => {
    if (!currentRound) return;

    try {
      const { data, error } = await supabase
        .from('jackpot_bets')
        .select('*')
        .eq('round_id', currentRound.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBets(data as JackpotBet[] || []);
    } catch (error) {
      console.error('Error fetching bets:', error);
    }
  };

  // Create or ensure active round via backend function
  const createNewRound = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('jackpot-admin', {
        body: { action: 'ensure_active_round' },
      });

      if (error) throw error;

      const round = (data as any)?.round as JackpotRound | null;

      if (!round) {
        console.error('No round returned from jackpot-admin function');
        return;
      }

      setCurrentRound(round);

      const startTime = new Date(round.started_at).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      setTimeLeft(remaining);
      setBets([]);
    } catch (error) {
      console.error('Error creating round:', error);
    }
  };

  // Draw winner using backend function (single real winner, no spam)
  const drawWinner = async () => {
    if (!currentRound || isDrawing) return;

    setIsDrawing(true);

    try {
      const { data, error } = await supabase.functions.invoke('jackpot-admin', {
        body: { action: 'draw_winner', roundId: currentRound.id },
      });

      if (error) {
        throw error;
      }

      const result = data as any;

      if (result?.noBets) {
        toast.info('Nenhuma aposta nesta rodada. Iniciando nova rodada...');
      } else if (result?.alreadyCompleted) {
        // Outro processo já completou a rodada, apenas sincroniza estado
        console.log('Jackpot round already completed by another process');
      } else if (result?.winnerWallet) {
        const winnerWallet = result.winnerWallet as string;
        const totalPot = Number(result.totalPot ?? currentRound.total_pot ?? 0);

        toast.success('🏆 Ganhador Sorteado!', {
          description: `${winnerWallet.slice(0, 8)}...${winnerWallet.slice(-4)} ganhou ${totalPot.toFixed(4)} SOL!`,
          duration: 8000,
        });
      }

      // Depois do sorteio, garante nova rodada ativa
      setTimeout(() => {
        createNewRound();
        setIsDrawing(false);
      }, 5000);
    } catch (error) {
      console.error('Error drawing winner:', error);
      toast.error('Erro ao sortear vencedor');
      setIsDrawing(false);
    }
  };

  // Timer effect - 60s countdown, chama drawWinner apenas uma vez por rodada
  useEffect(() => {
    if (!currentRound || isDrawing) return;

    if (timeLeft <= 0) {
      drawWinner();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentRound, timeLeft, isDrawing]);

  // Subscribe to real-time updates
  useEffect(() => {
    fetchRound();

    const roundChannel = supabase
      .channel('jackpot-rounds')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'jackpot_rounds'
      }, () => {
        fetchRound();
      })
      .subscribe();

    const betsChannel = supabase
      .channel('jackpot-bets')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'jackpot_bets'
      }, () => {
        fetchBets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(roundChannel);
      supabase.removeChannel(betsChannel);
    };
  }, []);

  useEffect(() => {
    if (currentRound) {
      fetchBets();
    }
  }, [currentRound]);

  // Place bet using backend function
  const placeBet = async (walletAddress: string, amount: number) => {
    if (!currentRound) {
      toast.error('Nenhuma rodada ativa');
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('jackpot-admin', {
        body: {
          action: 'place_bet',
          roundId: currentRound.id,
          walletAddress,
          amount,
        },
      });

      if (error) {
        throw error;
      }

      const result = data as any;
      const ticketStart = result?.ticketStart as number | undefined;
      const ticketEnd = result?.ticketEnd as number | undefined;
      const ticketCount = result?.ticketCount as number | undefined;

      if (ticketCount && ticketStart !== undefined && ticketEnd !== undefined) {
        toast.success('Aposta realizada!', {
          description: `Você recebeu ${ticketCount} tickets (#${ticketStart} - #${ticketEnd})`,
        });
      } else {
        toast.success('Aposta realizada!');
      }

      return true;
    } catch (error) {
      console.error('Error placing bet:', error);
      toast.error('Erro ao realizar aposta');
      return false;
    }
  };

  return {
    currentRound,
    bets,
    loading,
    timeLeft,
    isDrawing,
    placeBet,
    drawWinner,
    lastWinner
  };
};
