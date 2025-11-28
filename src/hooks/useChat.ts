import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  room_id: string;
  wallet_address: string;
  message: string;
  created_at: string;
}

const GLOBAL_ROOM_ID = '00000000-0000-0000-0000-000000000000';

export const useChat = (roomId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const actualRoomId = roomId === 'global' ? GLOBAL_ROOM_ID : roomId;

    if (!actualRoomId) return;

    fetchMessages(actualRoomId);

    const channel = supabase
      .channel(`chat_${actualRoomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${actualRoomId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const fetchMessages = async (actualRoomIdParam?: string | null) => {
    const actualRoomId =
      actualRoomIdParam ?? (roomId === 'global' ? GLOBAL_ROOM_ID : roomId);

    if (!actualRoomId) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', actualRoomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data as ChatMessage[]) || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (walletAddress: string, message: string) => {
    const actualRoomId = roomId === 'global' ? GLOBAL_ROOM_ID : roomId;

    if (!actualRoomId || !message.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: actualRoomId,
          wallet_address: walletAddress,
          message: message.trim()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  return { messages, loading, sendMessage };
};
