import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { WalletModal } from "@/components/WalletModal";
import { JackpotWheel } from "@/components/JackpotWheel";
import { ReferralPanel } from "@/components/ReferralPanel";
import { Trophy, Gift } from "lucide-react";
import { useWallet } from '@/contexts/WalletContext';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Bolada() {
  const { walletAddress } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-12 h-12 text-primary" />
              <h1 className="text-6xl font-bold text-foreground">JACKPOT</h1>
              <Trophy className="w-12 h-12 text-secondary" />
            </div>
            
            <div className="flex items-center justify-center gap-4 mb-4">
              <p className="text-2xl text-muted-foreground">Sorteio a cada 60 segundos</p>
              
              {/* Afiliados Button - Next to the title area */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">
                    <Gift className="w-4 h-4 mr-2" />
                    Afiliados (7%)
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 bg-card border-border" align="center">
                  <ReferralPanel walletAddress={walletAddress} />
                </PopoverContent>
              </Popover>
            </div>

            {!walletAddress && (
              <Button
                onClick={() => setShowWalletModal(true)}
                className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-8"
              >
                Conectar Carteira
              </Button>
            )}
          </div>

          <JackpotWheel />
        </div>
      </div>
    </div>
  );
}
