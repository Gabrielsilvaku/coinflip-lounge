import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAdmin = (walletAddress: string | null) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, [walletAddress]);

  const checkAdminStatus = async () => {
    if (!walletAddress) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // Check if PRINCEM (owner)
    if (walletAddress === 'PRINCEM') {
      setIsAdmin(true);
      setLoading(false);
      return;
    }

    setIsAdmin(false);
    setLoading(false);
  };

  const banUser = async (targetWallet: string, reason: string, ipAddress?: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('banned_users')
        .insert({
          wallet_address: targetWallet,
          ip_address: ipAddress,
          reason
        });

      if (error) throw error;

      await logAction('ban_user', targetWallet, { reason, ipAddress });
      toast.success('Usuário banido com sucesso');
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Erro ao banir usuário');
    }
  };

  const unbanUser = async (targetWallet: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('banned_users')
        .delete()
        .eq('wallet_address', targetWallet);

      if (error) throw error;

      await logAction('unban_user', targetWallet, {});
      toast.success('Usuário desbanido com sucesso');
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast.error('Erro ao desbanir usuário');
    }
  };

  const muteUser = async (targetWallet: string, reason: string, durationMinutes: number) => {
    if (!isAdmin) return;

    try {
      const mutedUntil = new Date();
      mutedUntil.setMinutes(mutedUntil.getMinutes() + durationMinutes);

      const { error } = await supabase
        .from('muted_users')
        .insert({
          wallet_address: targetWallet,
          reason,
          muted_until: mutedUntil.toISOString()
        });

      if (error) throw error;

      await logAction('mute_user', targetWallet, { reason, durationMinutes });
      toast.success(`Usuário silenciado por ${durationMinutes} minutos`);
    } catch (error) {
      console.error('Error muting user:', error);
      toast.error('Erro ao silenciar usuário');
    }
  };

  const unmuteUser = async (targetWallet: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('muted_users')
        .delete()
        .eq('wallet_address', targetWallet);

      if (error) throw error;

      await logAction('unmute_user', targetWallet, {});
      toast.success('Usuário desmutado com sucesso');
    } catch (error) {
      console.error('Error unmuting user:', error);
      toast.error('Erro ao desmutar usuário');
    }
  };

  const updateHouseEdge = async (newEdge: number) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('game_settings')
        .update({ setting_value: newEdge.toString() })
        .eq('setting_key', 'house_edge');

      if (error) throw error;

      await logAction('update_house_edge', '', { newEdge });
      toast.success(`Taxa da casa atualizada para ${newEdge}%`);
    } catch (error) {
      console.error('Error updating house edge:', error);
      toast.error('Erro ao atualizar taxa');
    }
  };

  const selectRaffleWinner = async (ticketNumber: number, walletAddress: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('raffle_winners')
        .insert({
          wallet_address: walletAddress,
          ticket_number: ticketNumber,
          raffle_id: 'main'
        });

      if (error) throw error;

      await logAction('select_raffle_winner', walletAddress, { ticketNumber });
      toast.success('Vencedor da rifa selecionado!');
    } catch (error) {
      console.error('Error selecting winner:', error);
      toast.error('Erro ao selecionar vencedor');
    }
  };

  const logAction = async (actionType: string, targetWallet: string, details: any) => {
    try {
      await supabase
        .from('action_logs')
        .insert({
          action_type: actionType,
          target_wallet: targetWallet,
          details
        });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  return {
    isAdmin,
    loading,
    banUser,
    unbanUser,
    muteUser,
    unmuteUser,
    updateHouseEdge,
    selectRaffleWinner
  };
};
