import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Owner wallet is verified server-side, this is just for UI display purposes
const OWNER_WALLET = '4uNhT1fDwJg62gYbT7sSfJ4Qmwp7XAGSVCoEMUUoHktU';

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

    try {
      // Verify admin status via backend
      const { data, error } = await supabase.functions.invoke('admin-verify', {
        body: {
          action: 'check_admin',
          walletAddress,
        },
      });

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data?.isAdmin === true);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get signature from wallet (requires wallet adapter integration)
  const getSignature = useCallback(async (message: string): Promise<string | null> => {
    try {
      // This would need to be integrated with the wallet adapter
      // For now, we'll show an error indicating signature is needed
      console.log('Signature required for message:', message);
      toast.error('Wallet signature required for this action');
      return null;
    } catch (error) {
      console.error('Error getting signature:', error);
      return null;
    }
  }, []);

  const callAdminAction = async (
    action: string,
    params: Record<string, any>
  ): Promise<boolean> => {
    if (!isAdmin || !walletAddress) {
      toast.error('Unauthorized');
      return false;
    }

    const timestamp = new Date().toISOString();
    const message = `Admin action: ${action} at ${timestamp}`;
    
    // For now, we'll call the backend which will verify the owner wallet
    // In production, you'd integrate with wallet adapter to sign messages
    try {
      const { data, error } = await supabase.functions.invoke('admin-verify', {
        body: {
          action,
          walletAddress,
          timestamp,
          // signature would come from wallet adapter
          ...params,
        },
      });

      if (error) {
        console.error(`Error executing ${action}:`, error);
        toast.error(`Failed to execute action: ${error.message}`);
        return false;
      }

      if (data?.success) {
        return true;
      } else if (data?.error) {
        toast.error(data.error);
        return false;
      }

      return false;
    } catch (error) {
      console.error(`Error executing ${action}:`, error);
      toast.error('Failed to execute admin action');
      return false;
    }
  };

  const banUser = async (targetWallet: string, reason: string, ipAddress?: string) => {
    const success = await callAdminAction('ban_user', {
      targetWallet,
      reason,
      ipAddress,
    });
    if (success) {
      toast.success('Usuário banido com sucesso');
    }
  };

  const unbanUser = async (targetWallet: string) => {
    const success = await callAdminAction('unban_user', { targetWallet });
    if (success) {
      toast.success('Usuário desbanido com sucesso');
    }
  };

  const muteUser = async (targetWallet: string, reason: string, durationMinutes: number) => {
    const success = await callAdminAction('mute_user', {
      targetWallet,
      reason,
      durationMinutes,
    });
    if (success) {
      toast.success(`Usuário silenciado por ${durationMinutes} minutos`);
    }
  };

  const unmuteUser = async (targetWallet: string) => {
    const success = await callAdminAction('unmute_user', { targetWallet });
    if (success) {
      toast.success('Usuário desmutado com sucesso');
    }
  };

  const updateHouseEdge = async (newEdge: number) => {
    const success = await callAdminAction('update_house_edge', { newEdge });
    if (success) {
      toast.success(`Taxa da casa atualizada para ${newEdge}%`);
    }
  };

  const selectRaffleWinner = async (ticketNumber: number, winnerWallet: string) => {
    const success = await callAdminAction('select_raffle_winner', {
      ticketNumber,
      winnerWallet,
    });
    if (success) {
      toast.success('Vencedor da rifa selecionado!');
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
    selectRaffleWinner,
  };
};
