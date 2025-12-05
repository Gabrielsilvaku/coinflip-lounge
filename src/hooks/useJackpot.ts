import { useState, useEffect, useRef } from 'react';
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

const ROUND_DURATION = 60;

export const useJackpot = () => {
  const [currentRound, setCurrentRound] = useState<JackpotRound | null>(null);
  const [bets, setBets] = useState<JackpotBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastWinner, setLastWinner] = useState<JackpotRound | null>(null);
  const drawingRef = useRef(false);
  const lastRoundIdRef = useRef<string | null>(null);

  // Fetch active round
  const fetchRound = async () => {
    try {
      const { data, error } = await supabase
        .from('jackpot_rounds')
        .select('*')
        .eq('status', 'active')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        // Check if round is expired (more than 60 seconds old)
        const startTime = new Date(data.started_at).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        
        if (elapsed > ROUND_DURATION) {
          // Round is expired, create a new one
          await forceNewRound();
          return;
        }
        
        setCurrentRound(data as JackpotRound);
        setTimeLeft(Math.max(0, ROUND_DURATION - elapsed));
      } else {
        await forceNewRound();
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
        .order('created_at', { ascending: true });

      if (error) throw error;
      setBets(data as JackpotBet[] || []);
    } catch (error) {
      console.error('Error fetching bets:', error);
    }
  };

  // Force create a brand new round
  const forceNewRound = async () => {
    try {
      // First complete any stale active rounds
      await supabase
        .from('jackpot_rounds')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('status', 'active');

      // Create new round
      const { data: newRound, error } = await supabase
        .from('jackpot_rounds')
        .insert({
          status: 'active',
          total_pot: 0,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      if (newRound) {
        setCurrentRound(newRound as JackpotRound);
        setTimeLeft(ROUND_DURATION);
        setBets([]);
        lastRoundIdRef.current = newRound.id;
      }
    } catch (error) {
      console.error('Error creating new round:', error);
    }
  };

  // Draw winner - only when there are bets
  const drawWinner = async () => {
    if (!currentRound || drawingRef.current || bets.length === 0) {
      // No bets, just create new round silently
      if (bets.length === 0) {
        await forceNewRound();
      }
      return;
    }

    drawingRef.current = true;
    setIsDrawing(true);

    try {
      const { data, error } = await supabase.functions.invoke('jackpot-admin', {
        body: { action: 'draw_winner', round_id: currentRound.id },
      });

      if (error) throw error;

      const result = data as any;

      if (result?.winner) {
        toast.success('🏆 Ganhador Sorteado!', {
          description: `${result.winner.slice(0, 8)}... ganhou ${(result.prize || currentRound.total_pot).toFixed(4)} SOL!`,
          duration: 8000,
        });
        
        setLastWinner({
          ...currentRound,
          winner_wallet: result.winner,
          status: 'completed'
        });
      }

      // Create new round after delay
      setTimeout(async () => {
        await forceNewRound();
        drawingRef.current = false;
        setIsDrawing(false);
      }, 3000);
    } catch (error) {
      console.error('Error drawing winner:', error);
      drawingRef.current = false;
      setIsDrawing(false);
      await forceNewRound();
    }
  };

  // Timer effect
  useEffect(() => {
    if (!currentRound || isDrawing) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up
          if (bets.length > 0 && !drawingRef.current) {
            drawWinner();
          } else if (!drawingRef.current) {
            forceNewRound();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRound?.id, isDrawing, bets.length]);

  // Subscribe to real-time updates
  useEffect(() => {
    fetchRound();

    const roundChannel = supabase
      .channel('jackpot-rounds-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'jackpot_rounds'
      }, (payload) => {
        if (payload.new && (payload.new as any).status === 'active') {
          setCurrentRound(payload.new as JackpotRound);
          const startTime = new Date((payload.new as any).started_at).getTime();
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setTimeLeft(Math.max(0, ROUND_DURATION - elapsed));
        }
      })
      .subscribe();

    const betsChannel = supabase
      .channel('jackpot-bets-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'jackpot_bets'
      }, (payload) => {
        if (currentRound && (payload.new as any).round_id === currentRound.id) {
          setBets(prev => [...prev, payload.new as JackpotBet]);
          setCurrentRound(prev => prev ? {
            ...prev,
            total_pot: (prev.total_pot || 0) + (payload.new as any).amount
          } : null);
        }
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
  }, [currentRound?.id]);

  // Place bet
  const placeBet = async (walletAddress: string, amount: number) => {
    if (!currentRound) {
      toast.error('Nenhuma rodada ativa');
      return false;
    }

    if (timeLeft <= 0) {
      toast.error('Rodada encerrada! Aguarde a próxima.');
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('jackpot-admin', {
        body: {
          action: 'place_bet',
          round_id: currentRound.id,
          wallet_address: walletAddress,
          amount,
        },
      });

      if (error) throw error;

      toast.success(`Aposta de ${amount} SOL realizada!`);
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
