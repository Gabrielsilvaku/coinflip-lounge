import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserProfile {
  wallet_address: string;
  display_name: string | null;
  avatar_url: string | null;
}

export const useUserProfile = (walletAddress: string | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setProfile(null);
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [walletAddress]);

  const fetchProfile = async () => {
    if (!walletAddress) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setProfile(data || null);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (displayName: string) => {
    if (!walletAddress) return;

    try {
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('user_profiles')
          .update({ 
            display_name: displayName,
            updated_at: new Date().toISOString()
          })
          .eq('wallet_address', walletAddress);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            wallet_address: walletAddress,
            display_name: displayName
          });

        if (error) throw error;
      }

      setProfile({ wallet_address: walletAddress, display_name: displayName, avatar_url: null });
      toast.success('Nome atualizado!');
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar nome');
    }
  };

  const getDisplayName = () => {
    if (profile?.display_name) return profile.display_name;
    if (walletAddress) return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    return 'Anônimo';
  };

  return { profile, loading, updateProfile, getDisplayName };
};
