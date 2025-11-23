import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type CoinSide = 'heads' | 'tails';

interface Room {
  id: string;
  creator_wallet: string;
  creator_side: CoinSide;
  bet_amount: number;
  status: string;
  created_at: string;
  joiner_wallet?: string;
  result?: string;
  winner_wallet?: string;
}

export const useCoinflipRooms = (walletAddress: string | null) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
    
    // Subscribe to room changes
    const channel = supabase
      .channel('coinflip_rooms')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coinflip_rooms'
        },
        () => {
          fetchRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('coinflip_rooms')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRooms((data as Room[]) || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (betAmount: number, side: CoinSide) => {
    if (!walletAddress) {
      toast.error('Connect your wallet first');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('coinflip_rooms')
        .insert({
          creator_wallet: walletAddress,
          creator_side: side,
          bet_amount: betAmount,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Room created successfully!');
      return data;
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!walletAddress) {
      toast.error('Conecte sua carteira primeiro');
      return { success: false };
    }

    try {
      const room = rooms.find(r => r.id === roomId);
      if (!room) return { success: false };

      // Update room with joiner
      const { error: updateError } = await supabase
        .from('coinflip_rooms')
        .update({ 
          joiner_wallet: walletAddress,
          status: 'playing'
        })
        .eq('id', roomId);

      if (updateError) throw updateError;

      return { success: true, room };
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Falha ao entrar na sala');
      return { success: false };
    }
  };

  const completeGame = async (roomId: string, result: CoinSide) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room || !room.joiner_wallet) return;

    const creatorWon = result === room.creator_side;
    const winnerWallet = creatorWon ? room.creator_wallet : room.joiner_wallet;

    try {
      // Update room with result
      await supabase
        .from('coinflip_rooms')
        .update({ 
          status: 'completed',
          result,
          winner_wallet: winnerWallet
        })
        .eq('id', roomId);

      // Save creator history
      await supabase
        .from('coinflip_history')
        .insert({
          player_wallet: room.creator_wallet,
          bet_amount: room.bet_amount,
          chosen_side: room.creator_side,
          result,
          won: creatorWon
        });

      // Save joiner history
      await supabase
        .from('coinflip_history')
        .insert({
          player_wallet: room.joiner_wallet,
          bet_amount: room.bet_amount,
          chosen_side: room.creator_side === 'heads' ? 'tails' : 'heads',
          result,
          won: !creatorWon
        });

      if (walletAddress === winnerWallet) {
        toast.success('🎉 Você ganhou!');
      } else {
        toast.error('😔 Você perdeu!');
      }
    } catch (error) {
      console.error('Error completing game:', error);
    }
  };

  return { rooms, loading, createRoom, joinRoom, completeGame };
};
