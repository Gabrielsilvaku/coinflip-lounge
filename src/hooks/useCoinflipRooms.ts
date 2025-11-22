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
      toast.error('Connect your wallet first');
      return false;
    }

    try {
      // Simulate joining and flipping
      const room = rooms.find(r => r.id === roomId);
      if (!room) return false;

      const flipResult: CoinSide = Math.random() > 0.5 ? 'heads' : 'tails';
      const won = flipResult === room.creator_side;

      // Update room status
      await supabase
        .from('coinflip_rooms')
        .update({ status: 'completed' })
        .eq('id', roomId);

      // Save to history
      await supabase
        .from('coinflip_history')
        .insert({
          player_wallet: walletAddress,
          bet_amount: room.bet_amount,
          chosen_side: room.creator_side === 'heads' ? 'tails' : 'heads',
          result: flipResult,
          won: !won
        });

      if (!won) {
        toast.success('You won! 🎉');
      } else {
        toast.error('You lost! 😔');
      }

      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Failed to join room');
      return false;
    }
  };

  return { rooms, loading, createRoom, joinRoom };
};
