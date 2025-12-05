import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";
import { useJackpot } from "@/hooks/useJackpot";
import { useWallet } from "@/contexts/WalletContext";
import { useChatUserInfo } from "@/hooks/useChatUserInfo";
import { AuraAvatar } from "@/components/AuraAvatar";
import { toast } from "sonner";

const PLACEHOLDER_SLOTS = 6;

export const JackpotWheel = () => {
  const { currentRound, bets, loading, timeLeft, isDrawing, placeBet, lastWinner } = useJackpot();
  const { walletAddress } = useWallet();
  const [betAmount, setBetAmount] = useState('0.1');

  const walletAddresses = bets.map(b => b.wallet_address);
  const userInfoMap = useChatUserInfo(walletAddresses);

  const handlePlaceBet = async () => {
    if (!walletAddress) {
      toast.error('Conecte sua carteira primeiro!');
      return;
    }

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount < 0.001) {
      toast.error('Valor mínimo de aposta é 0.001 SOL');
      return;
    }

    await placeBet(walletAddress, amount);
  };

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return 'Espera...';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}:${secs.toString().padStart(2, '0')}`;
    return `${secs}s`;
  };

  if (loading) {
    return (
      <Card className="bg-card border-2 border-primary p-8">
        <p className="text-center text-muted-foreground">Carregando jackpot...</p>
      </Card>
    );
  }

  const totalTickets = bets.reduce((sum, bet) => sum + (bet.ticket_end - bet.ticket_start + 1), 0);
  const myBet = bets.find(b => b.wallet_address === walletAddress);
  const myTickets = myBet ? myBet.ticket_end - myBet.ticket_start + 1 : 0;
  const myChance = totalTickets > 0 && myTickets > 0 ? ((myTickets / totalTickets) * 100).toFixed(2) : '0.00';

  // Create slots array with bets and empty placeholders
  const slots = [...bets];
  while (slots.length < PLACEHOLDER_SLOTS) {
    slots.push(null as any);
  }

  return (
    <div className="space-y-6">
      {/* Header with Logo and Bet Input */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl font-bold text-primary flex items-center gap-2">
            <span className="text-secondary">⊙</span> BOLADA
          </div>
          <p className="text-sm text-muted-foreground">O vencedor leva tudo...</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Valor da Aposta ~$0</span>
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
            <span className="text-primary font-bold">◎</span>
            <Input
              type="number"
              step="0.001"
              min="0.001"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="w-24 bg-transparent border-0 p-0 text-foreground focus-visible:ring-0"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBetAmount((parseFloat(betAmount) + 0.1).toFixed(3))}
            className="border-primary text-primary hover:bg-primary/10"
          >
            +0.1
          </Button>
          <Button
            onClick={handlePlaceBet}
            disabled={!walletAddress || isDrawing || timeLeft === 0}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6"
          >
            Lugar Apostar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/50 p-4 text-center">
          <p className="text-2xl md:text-3xl font-bold text-primary">
            ◎ {currentRound?.total_pot?.toFixed(3) || '0.000'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Valor do Jackpot</p>
        </Card>

        <Card className="bg-card border-border p-4 text-center">
          <p className="text-2xl md:text-3xl font-bold text-foreground">
            ◎ {myBet?.amount?.toFixed(3) || '0.000'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Sua Aposta</p>
        </Card>

        <Card className="bg-card border-border p-4 text-center">
          <p className="text-2xl md:text-3xl font-bold text-foreground">
            {myChance}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Sua Chance</p>
        </Card>

        <Card className="bg-card border-border p-4 text-center">
          <p className="text-2xl md:text-3xl font-bold text-secondary">
            {formatTime(timeLeft)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Tempo restante</p>
        </Card>
      </div>

      {/* Arrow indicator */}
      <div className="flex justify-center">
        <ChevronDown className="w-8 h-8 text-secondary animate-bounce" />
      </div>

      {/* Participants Carousel with Placeholder Slots */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4">
        {slots.map((bet, index) => {
          if (bet) {
            const userInfo = userInfoMap[bet.wallet_address];
            const displayName = userInfo?.display_name || `${bet.wallet_address.slice(0, 8)}...`;
            
            return (
              <Card
                key={bet.id}
                className="flex-shrink-0 bg-card border-primary/50 p-3 w-28 text-center hover:border-primary transition-colors"
              >
                <div className="flex justify-center mb-2">
                  <AuraAvatar
                    level={userInfo?.level || 0}
                    transformation={userInfo?.transformation}
                    size="md"
                  />
                </div>
                <p className="text-xs text-foreground font-semibold truncate">{displayName}</p>
                <p className="text-xs text-primary font-bold">◎ {bet.amount.toFixed(3)}</p>
              </Card>
            );
          }
          
          // Empty placeholder slot with "?"
          return (
            <Card
              key={`placeholder-${index}`}
              className="flex-shrink-0 bg-card/50 border-border border-dashed p-3 w-28 text-center opacity-50"
            >
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-semibold">Espera</p>
              <p className="text-xs text-muted-foreground">◎ 0.000</p>
            </Card>
          );
        })}
      </div>

      {/* Last Winners */}
      {lastWinner && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-card border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">REDONDO</span>
              <span className="text-xs text-muted-foreground">#{lastWinner.round_number}</span>
            </div>
            <div className="flex flex-col items-center">
              <AuraAvatar
                level={10}
                transformation="SSJ1"
                size="lg"
              />
              <p className="text-sm font-bold text-foreground mt-2">
                {lastWinner.winner_wallet?.slice(0, 8)}...
              </p>
              <Badge className="bg-secondary/20 text-secondary border-0 mt-1">
                ÚLTIMO VENCEDOR
              </Badge>
              <div className="flex justify-between w-full mt-3 text-xs">
                <span className="text-muted-foreground">Ganhou</span>
                <span className="text-primary font-bold">◎ {lastWinner.total_pot?.toFixed(3)}</span>
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">INFO</span>
            </div>
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-sm text-muted-foreground text-center">
                Aposte SOL para participar. Quanto mais você aposta, maior sua chance de ganhar o pot inteiro!
              </p>
              <div className="mt-4 text-xs text-muted-foreground">
                <p>• Mínimo: 0.001 SOL</p>
                <p>• Rodadas de 60 segundos</p>
                <p>• 1 vencedor leva tudo</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
