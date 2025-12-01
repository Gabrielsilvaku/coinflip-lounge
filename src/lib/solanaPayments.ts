import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { supabase } from '@/integrations/supabase/client';

const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

// Get house wallet from database
let HOUSE_WALLET: PublicKey | null = null;

const getHouseWallet = async (): Promise<PublicKey> => {
  if (HOUSE_WALLET) return HOUSE_WALLET;
  
  const { data } = await supabase
    .from('treasury_config')
    .select('wallet_address')
    .single();
  
  if (data?.wallet_address && data.wallet_address !== 'YOUR_TREASURY_WALLET_HERE') {
    HOUSE_WALLET = new PublicKey(data.wallet_address);
    return HOUSE_WALLET;
  }
  
  throw new Error('Treasury wallet not configured');
};

export const sendSolPayment = async (
  fromWallet: any,
  amount: number,
  applyHouseEdge: boolean = true
): Promise<{ success: boolean; signature?: string; error?: string; netAmount?: number }> => {
  try {
    if (!fromWallet || !fromWallet.publicKey) {
      return { success: false, error: 'Wallet não conectada' };
    }

    const houseWallet = await getHouseWallet();
    
    // Apply 3.5% house edge if enabled
    let netAmount = amount;
    if (applyHouseEdge) {
      const { data: config } = await supabase
        .from('treasury_config')
        .select('house_edge_percent')
        .single();
      
      const houseEdgePercent = config?.house_edge_percent || 3.5;
      netAmount = amount * (1 - houseEdgePercent / 100);
    }

    const lamports = Math.floor(netAmount * LAMPORTS_PER_SOL);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromWallet.publicKey,
        toPubkey: houseWallet,
        lamports,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromWallet.publicKey;

    // Assinar e enviar transação
    const signed = await fromWallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    
    // Aguardar confirmação
    await connection.confirmTransaction(signature, 'confirmed');

    return { success: true, signature, netAmount };
  } catch (error) {
    console.error('Erro ao enviar pagamento:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
};

export const getWalletBalance = async (publicKey: PublicKey): Promise<number> => {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Erro ao obter saldo:', error);
    return 0;
  }
};
