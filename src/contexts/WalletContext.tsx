import { createContext, useContext, useState, ReactNode } from 'react';
import { getWalletProvider } from '@/lib/solana';

interface WalletContextType {
  walletAddress: string | null;
  walletType: string | null;
  walletProvider: any;
  setWallet: (address: string, type: string) => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [walletProvider, setWalletProvider] = useState<any>(null);

  const setWallet = (address: string, type: string) => {
    setWalletAddress(address);
    setWalletType(type);
    const provider = getWalletProvider(type as 'phantom' | 'solflare' | 'coin98');
    setWalletProvider(provider);
  };

  const disconnect = () => {
    setWalletAddress(null);
    setWalletType(null);
    setWalletProvider(null);
  };

  return (
    <WalletContext.Provider value={{ walletAddress, walletType, walletProvider, setWallet, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};
