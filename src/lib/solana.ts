import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Mainnet connection
export const connection = new Connection(
  'https://api.mainnet-beta.solana.com',
  'confirmed'
);

// Get SOL balance
export const getBalance = async (publicKey: PublicKey): Promise<number> => {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error getting balance:', error);
    return 0;
  }
};

// Detect installed wallets
export const detectWallets = () => {
  const wallets = {
    phantom: typeof window !== 'undefined' && (window as any).phantom?.solana,
    solflare: typeof window !== 'undefined' && (window as any).solflare,
    coin98: typeof window !== 'undefined' && (window as any).coin98?.sol,
  };

  return wallets;
};

// Connect to wallet
export const connectWallet = async (walletType: 'phantom' | 'solflare' | 'coin98') => {
  const wallets = detectWallets();

  let provider;
  switch (walletType) {
    case 'phantom':
      provider = wallets.phantom;
      break;
    case 'solflare':
      provider = wallets.solflare;
      break;
    case 'coin98':
      provider = wallets.coin98;
      break;
  }

  if (!provider) {
    throw new Error(`${walletType} wallet not installed`);
  }

  try {
    const response = await provider.connect();
    return { 
      publicKey: response.publicKey.toString(),
      provider 
    };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

// Get connected wallet provider
export const getWalletProvider = (walletType: 'phantom' | 'solflare' | 'coin98') => {
  const wallets = detectWallets();
  
  switch (walletType) {
    case 'phantom':
      return wallets.phantom;
    case 'solflare':
      return wallets.solflare;
    case 'coin98':
      return wallets.coin98;
    default:
      return null;
  }
};
