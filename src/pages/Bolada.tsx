import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { WalletModal } from "@/components/WalletModal";
import { JackpotWheel } from "@/components/JackpotWheel";
import { ReferralPanel } from "@/components/ReferralPanel";
import { Trophy, Users, Gift } from "lucide-react";
import { useWallet } from '@/contexts/WalletContext';

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
            <p className="text-2xl text-muted-foreground">Sorteio a cada 60 segundos</p>

            {!walletAddress && (
              <Button
                onClick={() => setShowWalletModal(true)}
                className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-8"
              >
                Conectar Carteira
              </Button>
            )}
          </div>

          <Tabs defaultValue="jackpot" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="jackpot" className="text-lg">
                <Trophy className="w-5 h-5 mr-2" />
                Jackpot
              </TabsTrigger>
              <TabsTrigger value="afiliados" className="text-lg">
                <Gift className="w-5 h-5 mr-2" />
                Afiliados (7%)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="jackpot" className="space-y-6">
              <JackpotWheel />
            </TabsContent>

            <TabsContent value="afiliados">
              <ReferralPanel walletAddress={walletAddress} />
            </TabsContent>
          </Tabs>

          <Card className="mt-8 bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary/50 p-4 backdrop-blur-sm">
            <p className="text-foreground text-center font-semibold">
              🐉 A cada 60 segundos um novo ganhador! Quanto mais você aposta, mais chances de ganhar! 🐉
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
