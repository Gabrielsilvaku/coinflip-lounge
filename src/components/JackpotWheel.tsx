import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Timer, Users, Coins } from "lucide-react";
import { useState } from "react";
import { useJackpot } from "@/hooks/useJackpot";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";
import gogetaGif from "@/assets/gogeta.gif";

export const JackpotWheel = () => {
  const { currentRound, bets, loading, timeLeft, isDrawing, placeBet } = useJackpot();
  const { walletAddress } = useWallet();
  const [betAmount, setBetAmount] = useState('0.1');

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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card className="bg-card border-2 border-primary p-8">
        <p className="text-center text-muted-foreground">Carregando jackpot...</p>
      </Card>
    );
  }

  const totalTickets = bets.reduce((sum, bet) => sum + (bet.ticket_end - bet.ticket_start + 1), 0);

  return (
    <div className="space-y-6">
      {/* Timer and Prize Pool */}
      <Card className="bg-gradient-to-br from-primary/20 via-card to-secondary/20 border-2 border-primary/50 p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center justify-center gap-4">
            <Timer className="w-10 h-10 text-primary animate-pulse" />
            <div>
              <p className="text-sm text-muted-foreground">Timer</p>
              <p className="text-4xl font-bold text-primary">{formatTime(timeLeft)}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <Trophy className="w-10 h-10 text-secondary" />
            <div>
              <p className="text-sm text-muted-foreground">Prêmio Total</p>
              <p className="text-4xl font-bold text-secondary">
                {currentRound?.total_pot.toFixed(4) || '0.0000'} SOL
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Bet Input */}
      <Card className="bg-card border-2 border-primary/50 p-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.001"
              min="0.001"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Valor da aposta (min: 0.001 SOL)"
              className="bg-background text-foreground border-primary/50"
            />
            <Button
              onClick={handlePlaceBet}
              disabled={!walletAddress || isDrawing || timeLeft === 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 whitespace-nowrap"
            >
              <Coins className="w-5 h-5 mr-2" />
              Apostar
            </Button>
          </div>

          <div className="flex gap-2">
            {[0.001, 0.01, 0.1, 1].map((amount) => (
              <Button
                key={amount}
                onClick={() => setBetAmount(amount.toString())}
                variant="outline"
                size="sm"
                className="flex-1 border-primary/50 hover:bg-primary/20"
              >
                {amount} SOL
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Participants List */}
      <Card className="bg-card border-2 border-primary/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Participantes ({bets.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Total: {totalTickets} tickets
          </p>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {bets.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma aposta ainda. Seja o primeiro!
            </p>
          ) : (
            bets.map((bet) => {
              const ticketCount = bet.ticket_end - bet.ticket_start + 1;
              const winChance = totalTickets > 0 ? ((ticketCount / totalTickets) * 100).toFixed(2) : '0.00';
              
              return (
                <div
                  key={bet.id}
                  className="bg-background/50 border border-border rounded-lg p-3 flex items-center justify-between hover:border-primary/50 transition-colors"
                >
                  <div>
                    <p className="font-mono text-sm">
                      {bet.wallet_address.slice(0, 8)}...{bet.wallet_address.slice(-4)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ticketCount} tickets
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{bet.amount.toFixed(4)} SOL</p>
                    <p className="text-xs text-secondary">{winChance}%</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};
