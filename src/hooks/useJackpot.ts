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
      } else {
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

  // Create new round
  const createNewRound = async () => {
    try {
      const { data, error } = await supabase
        .from('jackpot_rounds')
        .insert({
          status: 'active',
          total_pot: 0,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      setCurrentRound(data as JackpotRound);
      setTimeLeft(60);
      setBets([]);
    } catch (error) {
      console.error('Error creating round:', error);
    }
  };

  // Draw winner
  const drawWinner = async () => {
    if (!currentRound || bets.length === 0) return;

    setIsDrawing(true);
    
    try {
      // Get total tickets
      const totalTickets = bets.reduce((sum, bet) => sum + (bet.ticket_end - bet.ticket_start + 1), 0);
      const winningTicket = Math.floor(Math.random() * totalTickets) + 1;
      
      // Find winner
      let accumulatedTickets = 0;
      let winner: JackpotBet | null = null;
      
      for (const bet of bets) {
        accumulatedTickets += (bet.ticket_end - bet.ticket_start + 1);
        if (winningTicket <= accumulatedTickets) {
          winner = bet;
          break;
        }
      }

      if (winner) {
        // Update round with winner
        const { error } = await supabase
          .from('jackpot_rounds')
          .update({
            status: 'completed',
            winner_wallet: winner.wallet_address,
            winner_ticket_number: winningTicket,
            completed_at: new Date().toISOString()
          })
          .eq('id', currentRound.id);

        if (error) throw error;

        toast.success('🏆 Ganhador Sorteado!', {
          description: `${winner.wallet_address.slice(0, 8)}...${winner.wallet_address.slice(-4)} ganhou ${currentRound.total_pot.toFixed(4)} SOL!`,
          duration: 8000
        });

        // Create new round after short delay
        setTimeout(() => {
          createNewRound();
          setIsDrawing(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error drawing winner:', error);
      toast.error('Erro ao sortear vencedor');
      setIsDrawing(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (!currentRound) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          drawWinner();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRound, bets]);

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

  // Place bet
  const placeBet = async (walletAddress: string, amount: number) => {
    if (!currentRound) {
      toast.error('Nenhuma rodada ativa');
      return false;
    }

    try {
      // Get last ticket number
      const { data: lastBet } = await supabase
        .from('jackpot_bets')
        .select('ticket_end')
        .eq('round_id', currentRound.id)
        .order('ticket_end', { ascending: false })
        .limit(1)
        .single();

      const ticketStart = (lastBet?.ticket_end || 0) + 1;
      const ticketCount = Math.floor(amount * 10); // 1 SOL = 10 tickets
      const ticketEnd = ticketStart + ticketCount - 1;

      // Insert bet
      const { error: betError } = await supabase
        .from('jackpot_bets')
        .insert({
          round_id: currentRound.id,
          wallet_address: walletAddress,
          amount,
          ticket_start: ticketStart,
          ticket_end: ticketEnd
        });

      if (betError) throw betError;

      // Update total pot
      const { error: updateError } = await supabase
        .from('jackpot_rounds')
        .update({
          total_pot: (currentRound.total_pot || 0) + amount
        })
        .eq('id', currentRound.id);

      if (updateError) throw updateError;

      toast.success('Aposta realizada!', {
        description: `Você recebeu ${ticketCount} tickets (#${ticketStart} - #${ticketEnd})`
      });

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
    drawWinner
  };
};
