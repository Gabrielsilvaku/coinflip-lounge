import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Referral {
  id: string;
  referral_code: string;
  referrer_wallet: string;
  referee_wallet: string;
  total_earned: number;
  created_at: string;
}

interface ReferralEarning {
  id: string;
  amount: number;
  source: string;
  created_at: string;
}

export const useReferrals = (walletAddress: string | null) => {
  const [referralCode, setReferralCode] = useState<string>('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [earnings, setEarnings] = useState<ReferralEarning[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(true);

  // Generate referral code
  const generateReferralCode = (wallet: string): string => {
    const hash = wallet.slice(-8).toUpperCase();
    return `REF-${hash}`;
  };

  // Fetch referral data
  const fetchReferralData = async () => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }

    try {
      const code = generateReferralCode(walletAddress);
      setReferralCode(code);

      // Fetch referrals made by this user
      const { data: referralsData, error: refError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_wallet', walletAddress)
        .order('created_at', { ascending: false });

      if (refError) throw refError;
      setReferrals(referralsData || []);

      // Calculate total earned
      const total = (referralsData || []).reduce((sum, ref) => sum + (ref.total_earned || 0), 0);
      setTotalEarned(total);

      // Fetch earnings history
      const { data: earningsData, error: earnError } = await supabase
        .from('referral_earnings')
        .select('*')
        .in('referral_id', (referralsData || []).map(r => r.id))
        .order('created_at', { ascending: false });

      if (earnError) throw earnError;
      setEarnings(earningsData || []);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply referral code when signing up
  const applyReferralCode = async (refereeWallet: string, code: string) => {
    try {
      // Find referrer by code
      const referrerWallet = code.replace('REF-', '');
      
      // Check if already referred
      const { data: existing } = await supabase
        .from('referrals')
        .select('*')
        .eq('referee_wallet', refereeWallet)
        .single();

      if (existing) {
        toast.info('Você já usou um código de referência');
        return false;
      }

      // Create referral
      const { error } = await supabase
        .from('referrals')
        .insert({
          referral_code: code,
          referrer_wallet: referrerWallet,
          referee_wallet: refereeWallet,
          total_earned: 0
        });

      if (error) throw error;

      toast.success('Código de referência aplicado!');
      return true;
    } catch (error) {
      console.error('Error applying referral code:', error);
      toast.error('Código de referência inválido');
      return false;
    }
  };

  // Add referral earning
  const addReferralEarning = async (
    refereeWallet: string,
    amount: number,
    source: string
  ) => {
    try {
      // Find referral
      const { data: referral } = await supabase
        .from('referrals')
        .select('*')
        .eq('referee_wallet', refereeWallet)
        .single();

      if (!referral) return;

      // Calculate 7% commission
      const commission = amount * 0.07;

      // Add earning
      const { error: earnError } = await supabase
        .from('referral_earnings')
        .insert({
          referral_id: referral.id,
          amount: commission,
          source
        });

      if (earnError) throw earnError;

      // Update total earned
      const { error: updateError } = await supabase
        .from('referrals')
        .update({
          total_earned: (referral.total_earned || 0) + commission
        })
        .eq('id', referral.id);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error adding referral earning:', error);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, [walletAddress]);

  return {
    referralCode,
    referrals,
    earnings,
    totalEarned,
    loading,
    applyReferralCode,
    addReferralEarning
  };
};
