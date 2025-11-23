import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

// Endereço da casa (treasury) - SUBSTITUA COM SEU ENDEREÇO REAL
const HOUSE_WALLET = new PublicKey('YOUR_TREASURY_WALLET_ADDRESS_HERE');

export const sendSolPayment = async (
  fromWallet: any,
  amount: number
): Promise<{ success: boolean; signature?: string; error?: string }> => {
  try {
    if (!fromWallet || !fromWallet.publicKey) {
      return { success: false, error: 'Wallet não conectada' };
    }

    const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromWallet.publicKey,
        toPubkey: HOUSE_WALLET,
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

    return { success: true, signature };
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
