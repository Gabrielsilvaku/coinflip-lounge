import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, HelpCircle, Trophy, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useJackpot } from "@/hooks/useJackpot";
import { useWallet } from "@/contexts/WalletContext";
import { useChatUserInfo } from "@/hooks/useChatUserInfo";
import { AuraAvatar } from "@/components/AuraAvatar";
import { toast } from "sonner";
import solIcon from "@/assets/sol-icon.png";

const TOTAL_SLOTS = 12;

export const JackpotWheel = () => {
  const { currentRound, bets, loading, timeLeft, isDrawing, placeBet, lastWinner } = useJackpot();
  const { walletAddress } = useWallet();
  const [betAmount, setBetAmount] = useState('0.1');
  const carouselRef = useRef<HTMLDivElement>(null);
  const [spinOffset, setSpinOffset] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinSpeed, setSpinSpeed] = useState(0);
  const animationRef = useRef<number>();

  const walletAddresses = bets.map(b => b.wallet_address);
  if (lastWinner?.winner_wallet && !walletAddresses.includes(lastWinner.winner_wallet)) {
    walletAddresses.push(lastWinner.winner_wallet);
  }
  const userInfoMap = useChatUserInfo(walletAddresses);

  // Carousel spinning animation
  useEffect(() => {
    if (bets.length === 0) {
      setSpinSpeed(0);
      return;
    }

    // Slow spin during countdown
    if (timeLeft > 5 && !isDrawing) {
      setSpinSpeed(1); // Slow
      setIsSpinning(true);
    } 
    // Fast spin when timer ending or drawing
    else if ((timeLeft <= 5 && timeLeft > 0) || isDrawing) {
      setSpinSpeed(5); // Fast
      setIsSpinning(true);
    }
    // Stop when done
    else if (timeLeft === 0 && !isDrawing) {
      setSpinSpeed(0);
      setIsSpinning(false);
    }
  }, [timeLeft, isDrawing, bets.length]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      if (spinSpeed > 0) {
        setSpinOffset(prev => (prev + spinSpeed) % 1000);
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [spinSpeed]);

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
    if (seconds <= 0) return '0s';
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

  // Create infinite slots array for carousel effect
  const createCarouselSlots = () => {
    const slots = [];
    if (bets.length > 0) {
      // Repeat bets to fill carousel
      for (let i = 0; i < TOTAL_SLOTS * 3; i++) {
        slots.push(bets[i % bets.length]);
      }
    } else {
      // Show placeholder slots
      for (let i = 0; i < TOTAL_SLOTS; i++) {
        slots.push(null);
      }
    }
    return slots;
  };

  const carouselSlots = createCarouselSlots();

  // Get winner info
  const winnerInfo = lastWinner?.winner_wallet ? userInfoMap[lastWinner.winner_wallet] : null;
  const winnerDisplayName = winnerInfo?.display_name || (lastWinner?.winner_wallet ? `${lastWinner.winner_wallet.slice(0, 8)}...` : null);

  return (
    <div className="space-y-6">
      {/* Header with Logo and Bet Input */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl font-bold text-primary flex items-center gap-2">
            <img src={solIcon} alt="SOL" className="w-10 h-10" />
            BOLADA
          </div>
          <p className="text-sm text-muted-foreground">O vencedor leva tudo...</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
            <img src={solIcon} alt="SOL" className="w-5 h-5" />
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
            <Zap className="w-4 h-4 mr-2" />
            Apostar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/50 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold text-primary">
            <img src={solIcon} alt="SOL" className="w-6 h-6" />
            {currentRound?.total_pot?.toFixed(3) || '0.000'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Valor do Jackpot</p>
        </Card>

        <Card className="bg-card border-border p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold text-foreground">
            <img src={solIcon} alt="SOL" className="w-6 h-6" />
            {myBet?.amount?.toFixed(3) || '0.000'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Sua Aposta</p>
        </Card>

        <Card className="bg-card border-border p-4 text-center">
          <p className="text-2xl md:text-3xl font-bold text-foreground">
            {myChance}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Sua Chance</p>
        </Card>

        <Card className={`border-border p-4 text-center ${timeLeft <= 10 ? 'bg-destructive/20 border-destructive' : 'bg-card'}`}>
          <p className={`text-2xl md:text-3xl font-bold ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-secondary'}`}>
            {formatTime(timeLeft)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Tempo restante</p>
        </Card>
      </div>

      {/* Arrow indicator */}
      <div className="flex justify-center">
        <ChevronDown className={`w-8 h-8 text-secondary ${isSpinning ? 'animate-bounce' : ''}`} />
      </div>

      {/* Spinning Carousel */}
      <div className="relative overflow-hidden rounded-xl border-2 border-primary/50 bg-card/50 p-4">
        {/* Center selection indicator */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-secondary z-10 transform -translate-x-1/2" />
        <div className="absolute left-1/2 -top-2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-secondary z-10 transform -translate-x-1/2" />
        <div className="absolute left-1/2 -bottom-2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[10px] border-l-transparent border-r-transparent border-b-secondary z-10 transform -translate-x-1/2" />

        <div 
          ref={carouselRef}
          className="flex items-center gap-3 transition-transform"
          style={{ 
            transform: `translateX(-${spinOffset}px)`,
            transition: spinSpeed > 0 ? 'none' : 'transform 0.5s ease-out'
          }}
        >
          {carouselSlots.map((bet, index) => {
            if (bet) {
              const userInfo = userInfoMap[bet.wallet_address];
              const displayName = userInfo?.display_name || `${bet.wallet_address.slice(0, 6)}...`;
              
              return (
                <Card
                  key={`${bet.id}-${index}`}
                  className="flex-shrink-0 bg-card border-primary/30 p-3 w-24 text-center hover:border-primary transition-colors"
                >
                  <div className="flex justify-center mb-1">
                    <AuraAvatar
                      level={userInfo?.level || 0}
                      transformation={userInfo?.transformation}
                      size="md"
                    />
                  </div>
                  <p className="text-[10px] text-foreground font-semibold truncate">{displayName}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <img src={solIcon} alt="SOL" className="w-3 h-3" />
                    <span className="text-[10px] text-primary font-bold">{bet.amount.toFixed(3)}</span>
                  </div>
                </Card>
              );
            }
            
            // Empty placeholder slot with "?"
            return (
              <Card
                key={`placeholder-${index}`}
                className="flex-shrink-0 bg-card/30 border-border border-dashed p-3 w-24 text-center opacity-50"
              >
                <div className="flex justify-center mb-1">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground font-semibold">?</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <img src={solIcon} alt="SOL" className="w-3 h-3 opacity-50" />
                  <span className="text-[10px] text-muted-foreground">0.000</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Winner Stats Section */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Last Winner */}
        <Card className="bg-gradient-to-br from-card to-secondary/5 border-secondary/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Rodada</span>
            <span className="text-xs text-secondary font-mono">#{lastWinner?.round_number || '---'}</span>
          </div>
          
          {lastWinner?.winner_wallet ? (
            <div className="flex flex-col items-center">
              <AuraAvatar
                level={winnerInfo?.level || 0}
                transformation={winnerInfo?.transformation}
                size="lg"
              />
              <p className="text-sm font-bold text-foreground mt-2">
                {winnerDisplayName}
              </p>
              {winnerInfo?.level !== undefined && winnerInfo.level > 0 && (
                <Badge 
                  variant="outline" 
                  className="mt-1 border-secondary text-secondary"
                >
                  Lv. {winnerInfo.level} - {winnerInfo.transformation || 'Base Form'}
                </Badge>
              )}
              <Badge className="bg-secondary/20 text-secondary border-0 mt-2">
                <Trophy className="w-3 h-3 mr-1" />
                ÚLTIMO VENCEDOR
              </Badge>
              <div className="flex flex-col gap-2 w-full mt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ganhou</span>
                  <div className="flex items-center gap-1">
                    <img src={solIcon} alt="SOL" className="w-4 h-4" />
                    <span className="text-primary font-bold">{lastWinner.total_pot?.toFixed(3) || '0.000'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-2">
                <HelpCircle className="w-12 h-12 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Nenhum vencedor ainda</p>
              <div className="flex items-center gap-1 mt-2">
                <img src={solIcon} alt="SOL" className="w-4 h-4 opacity-50" />
                <span className="text-muted-foreground">0.000</span>
              </div>
            </div>
          )}
        </Card>

        {/* Current Round Stats */}
        <Card className="bg-card border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Rodada Atual</span>
            <span className="text-xs text-primary font-mono">#{currentRound?.round_number || '---'}</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Participantes</span>
              <span className="text-lg font-bold text-foreground">{bets.length}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Pot Total</span>
              <div className="flex items-center gap-2">
                <img src={solIcon} alt="SOL" className="w-5 h-5" />
                <span className="text-lg font-bold text-primary">{currentRound?.total_pot?.toFixed(3) || '0.000'}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Sua Aposta</span>
              <div className="flex items-center gap-2">
                <img src={solIcon} alt="SOL" className="w-5 h-5" />
                <span className="text-lg font-bold text-foreground">{myBet?.amount?.toFixed(3) || '0.000'}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/30">
              <span className="text-sm text-muted-foreground">Sua Chance</span>
              <span className="text-lg font-bold text-primary">{myChance}%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
