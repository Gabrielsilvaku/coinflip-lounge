import { Button } from "@/components/ui/button";
import { Bell, User, Shield, LogOut, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { WalletModal } from "./WalletModal";
import { Link, useLocation } from "react-router-dom";
import { getBalance } from "@/lib/solana";
import { PublicKey } from "@solana/web3.js";
import profileIcon from "@/assets/profile-icon.jpeg";
import { useWallet } from "@/contexts/WalletContext";
import { LevelDisplay } from "./LevelDisplay";

export const Header = () => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { walletAddress } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (walletAddress) {
      const fetchBalance = async () => {
        try {
          const publicKey = new PublicKey(walletAddress);
          const bal = await getBalance(publicKey);
          setBalance(bal);
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      };

      fetchBalance();
      const interval = setInterval(fetchBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [walletAddress]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-primary/20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={profileIcon}
              alt="ZPOWERSOL"
              className="h-12 w-12 object-contain rounded-full"
            />
            <div>
              <div className="text-xl font-bold text-foreground tracking-wider">ZPOWERSOL</div>
              <div className="text-xs text-muted-foreground">CASSINO</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/raffle">
              <Button
                variant="ghost"
                className={`text-foreground hover:text-primary hover:bg-transparent transition-colors ${isActive('/raffle') ? 'text-primary' : ''}`}
              >
                Rifa
              </Button>
            </Link>
            <Link to="/coinflip">
              <Button
                variant="ghost"
                className={`text-foreground hover:text-primary hover:bg-transparent transition-colors ${isActive('/coinflip') ? 'text-primary' : ''}`}
              >
                Coinflip
              </Button>
            </Link>
            <Link to="/bolada">
              <Button
                variant="ghost"
                className={`text-foreground hover:text-primary hover:bg-transparent transition-colors ${isActive('/bolada') ? 'text-primary' : ''}`}
              >
                Bolada
              </Button>
            </Link>
            {walletAddress === 'PRINCEM' && (
              <Link to="/admin">
                <Button
                  variant="ghost"
                  className={`text-purple-400 hover:text-purple-300 hover:bg-transparent transition-colors ${isActive('/admin') ? 'text-purple-300' : ''}`}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              className="text-foreground hover:text-secondary hover:bg-transparent transition-colors relative group"
              disabled
            >
              Mugen Future
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-card border border-secondary px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Em Breve
              </span>
            </Button>
          </nav>

          <div className="flex items-center gap-3">
            {walletAddress && (
              <div className="hidden lg:block">
                <LevelDisplay walletAddress={walletAddress} />
              </div>
            )}

            {walletAddress ? (
              <>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-card-glass border border-primary/30 rounded-lg">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Saldo</div>
                    <div className="text-sm font-bold text-primary">{balance.toFixed(4)} SOL</div>
                  </div>
                </div>

                <Button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <User className="mr-2 h-4 w-4" />
                  {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsWalletModalOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon-cyan font-semibold"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Conectar
              </Button>
            )}
          </div>
        </div>
      </header>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  );
};
