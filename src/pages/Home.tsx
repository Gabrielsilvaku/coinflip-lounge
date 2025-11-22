import { Button } from "@/components/ui/button";
import { useState } from "react";
import { WalletModal } from "@/components/WalletModal";
import { useNavigate } from "react-router-dom";
import bannerFull from "@/assets/banner-full.jpeg";

const Home = () => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={bannerFull}
          alt="ZPOWERSOL CASSINO"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      </div>

      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center justify-center min-h-screen">
        <div className="flex flex-col gap-6 items-center">
          <Button
            onClick={() => setIsWalletModalOpen(true)}
            className="bg-transparent border-2 border-primary text-primary hover:bg-primary/10 px-16 py-8 text-2xl font-semibold shadow-neon-cyan hover:shadow-intense transition-all"
          >
            Select Wallet
          </Button>
          <Button
            onClick={() => navigate('/rifa')}
            className="bg-transparent border-2 border-secondary text-secondary hover:bg-secondary/10 px-16 py-8 text-2xl font-semibold shadow-neon-purple hover:shadow-intense transition-all"
          >
            Enter Casino
          </Button>
        </div>
      </div>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={() => setIsWalletModalOpen(false)}
      />
    </div>
  );
};

export default Home;
