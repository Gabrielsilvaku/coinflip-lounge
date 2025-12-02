import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserInfo {
  display_name: string | null;
  level: number;
  transformation: string | null;
  aura_color: string;
}

const AURA_COLORS = {
  0: 'from-gray-400 to-gray-600',
  10: 'from-yellow-400 to-yellow-600',
  20: 'from-yellow-500 to-yellow-700',
  30: 'from-yellow-600 to-amber-600',
  40: 'from-red-500 to-pink-600',
  50: 'from-red-600 to-rose-700',
  60: 'from-blue-400 to-cyan-600',
  70: 'from-blue-600 to-purple-600',
  90: 'from-purple-400 to-indigo-600',
  100: 'from-white to-gray-300'
};

export const useChatUserInfo = (walletAddresses: string[]) => {
  const [userInfoMap, setUserInfoMap] = useState<Record<string, UserInfo>>({});

  useEffect(() => {
    if (walletAddresses.length === 0) return;

    fetchUserInfo();

    // Subscribe to real-time updates
    const channels = walletAddresses.map(wallet => {
      return supabase
        .channel(`user_info_${wallet}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_levels',
            filter: `wallet_address=eq.${wallet}`
          },
          () => {
            fetchUserInfo();
          }
        )
        .subscribe();
    });

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [walletAddresses.join(',')]);

  const fetchUserInfo = async () => {
    try {
      const uniqueWallets = [...new Set(walletAddresses)];
      
      const [profilesData, levelsData] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('wallet_address, display_name')
          .in('wallet_address', uniqueWallets),
        supabase
          .from('user_levels')
          .select('wallet_address, level, transformation')
          .in('wallet_address', uniqueWallets)
      ]);

      const newUserInfoMap: Record<string, UserInfo> = {};

      uniqueWallets.forEach(wallet => {
        const profile = profilesData.data?.find(p => p.wallet_address === wallet);
        const level = levelsData.data?.find(l => l.wallet_address === wallet);
        
        const userLevel = level?.level || 0;
        const auraLevel = Object.keys(AURA_COLORS)
          .map(Number)
          .reverse()
          .find(l => userLevel >= l) || 0;

        newUserInfoMap[wallet] = {
          display_name: profile?.display_name || null,
          level: userLevel,
          transformation: level?.transformation || null,
          aura_color: AURA_COLORS[auraLevel as keyof typeof AURA_COLORS]
        };
      });

      setUserInfoMap(newUserInfoMap);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  return userInfoMap;
};
