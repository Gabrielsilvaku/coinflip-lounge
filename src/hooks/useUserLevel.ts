import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserLevel {
  level: number;
  xp: number;
  total_wagered: number;
  transformation: string | null;
}

const TRANSFORMATIONS = [
  { level: 10, name: 'SSJ1', color: 'from-yellow-400 to-yellow-600' },
  { level: 20, name: 'SSJ2', color: 'from-yellow-500 to-yellow-700' },
  { level: 30, name: 'SSJ3', color: 'from-yellow-600 to-amber-600' },
  { level: 40, name: 'SSJ4', color: 'from-red-500 to-pink-600' },
  { level: 50, name: 'SSJ God', color: 'from-red-600 to-rose-700' },
  { level: 60, name: 'SSJ Blue', color: 'from-blue-400 to-cyan-600' },
  { level: 70, name: 'SSJ Blue Evolution', color: 'from-blue-600 to-purple-600' },
  { level: 90, name: 'Ultra Instinct Omen', color: 'from-purple-400 to-indigo-600' },
  { level: 100, name: 'Ultra Instinct Mastered', color: 'from-white to-gray-300' }
];

export const useUserLevel = (walletAddress: string | null) => {
  const [userLevel, setUserLevel] = useState<UserLevel>({
    level: 0,
    xp: 0,
    total_wagered: 0,
    transformation: null
  });

  useEffect(() => {
    if (!walletAddress) return;

    fetchUserLevel();

    const channel = supabase
      .channel(`level_${walletAddress}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_levels',
          filter: `wallet_address=eq.${walletAddress}`
        },
        (payload) => {
          if (payload.new) {
            setUserLevel(payload.new as UserLevel);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [walletAddress]);

  const fetchUserLevel = async () => {
    if (!walletAddress) return;

    try {
      const { data, error } = await supabase
        .from('user_levels')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setUserLevel(data);
      } else {
        // Create initial level
        const { data: newLevel, error: insertError } = await supabase
          .from('user_levels')
          .insert({
            wallet_address: walletAddress,
            level: 0,
            xp: 0,
            total_wagered: 0
          })
          .select()
          .single();

        if (insertError) throw insertError;
        if (newLevel) setUserLevel(newLevel);
      }
    } catch (error) {
      console.error('Error fetching user level:', error);
    }
  };

  const addXP = async (solWagered: number) => {
    if (!walletAddress) return;

    try {
      const xpGained = solWagered * 10; // 10 XP por SOL apostado
      const newXP = userLevel.xp + xpGained;
      const newTotalWagered = userLevel.total_wagered + solWagered;
      
      // 100 XP por nível
      const newLevel = Math.min(100, Math.floor(newXP / 100));
      
      // Determinar transformação
      const transformation = TRANSFORMATIONS
        .reverse()
        .find(t => newLevel >= t.level)?.name || null;

      const { error } = await supabase
        .from('user_levels')
        .update({
          level: newLevel,
          xp: newXP,
          total_wagered: newTotalWagered,
          transformation,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', walletAddress);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  };

  const getTransformation = () => {
    return TRANSFORMATIONS.reverse().find(t => userLevel.level >= t.level);
  };

  const getNextTransformation = () => {
    return TRANSFORMATIONS.find(t => userLevel.level < t.level);
  };

  const getProgressToNextLevel = () => {
    const currentLevelXP = userLevel.level * 100;
    const nextLevelXP = (userLevel.level + 1) * 100;
    const progress = ((userLevel.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  return {
    userLevel,
    addXP,
    getTransformation,
    getNextTransformation,
    getProgressToNextLevel
  };
};
