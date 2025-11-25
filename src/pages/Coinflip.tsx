import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { WalletModal } from "@/components/WalletModal";
import { CoinFlip3D } from "@/components/CoinFlip3D";
import { useCoinflipRooms } from "@/hooks/useCoinflipRooms";
import { useCoinflipHistory } from "@/hooks/useCoinflipHistory";
import { useWallet } from "@/contexts/WalletContext";
import { useUserLevel } from "@/hooks/useUserLevel";
import { ChatBox } from "@/components/ChatBox";
import gokuCoin from "@/assets/goku-coin.png";
import vegetaCoin from "@/assets/vegeta-coin.png";
import { Coins, Users, Clock } from "lucide-react";

type CoinSide = 'heads' | 'tails';

export default function Coinflip() {
  const [selectedSide, setSelectedSide] = useState<CoinSide | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<CoinSide | null>(null);
  const [betAmount, setBetAmount] = useState("0.1");
  const { walletAddress } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [mode, setMode] = useState<'solo' | 'multiplayer'>('multiplayer');
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const { addXP } = useUserLevel(walletAddress);

  const { rooms, loading: roomsLoading, createRoom, joinRoom } = useCoinflipRooms(walletAddress);
  const { history, loading: historyLoading } = useCoinflipHistory(walletAddress);

  const handleFlip = (side: CoinSide) => {
    if (isFlipping) return;

    if (!walletAddress) {
      setShowWalletModal(true);
      return;
    }

    setSelectedSide(side);
    setIsFlipping(true);
    setResult(null);

    toast.loading("Girando a moeda...", { id: "flipping" });

    setTimeout(() => {
      const flipResult: CoinSide = Math.random() > 0.5 ? 'heads' : 'tails';
      setResult(flipResult);
      setIsFlipping(false);

      toast.dismiss("flipping");

      const amount = parseFloat(betAmount);
      
      if (flipResult === side) {
        toast.success(`🎉 Você ganhou! ${flipResult === 'heads' ? 'HEADS (Goku)' : 'TAILS (Vegeta)'} venceu!`, {
          duration: 4000,
        });
        // Add XP for winning
        if (walletAddress) {
          addXP(amount);
        }
      } else {
        toast.error(`😔 Você perdeu! ${flipResult === 'heads' ? 'HEADS (Goku)' : 'TAILS (Vegeta)'} venceu!`, {
          duration: 4000,
        });
        // Add XP for playing (even when losing)
        if (walletAddress) {
          addXP(amount);
        }
      }
    }, 3000);
  };

  const handleCreateRoom = async () => {
    if (!walletAddress) {
      setShowWalletModal(true);
      return;
    }

    if (!selectedSide) {
      toast.error("Escolha um lado primeiro!");
      return;
    }

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount < 0.1 || amount > 1000) {
      toast.error("Valor inválido! Use entre 0.1 e 1000 SOL");
      return;
    }

    await createRoom(amount, selectedSide);
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!walletAddress) {
      setShowWalletModal(true);
      return;
    }

    toast.loading("Entrando na sala...", { id: "joining" });
    const success = await joinRoom(roomId);
    toast.dismiss("joining");

    if (success) {
      toast.success("Partida iniciada!");
      setActiveRoomId(roomId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Coins className="w-10 h-10 text-primary" />
              <h1 className="text-5xl font-bold text-foreground">COINFLIP</h1>
              <Coins className="w-10 h-10 text-secondary" />
            </div>
            <p className="text-xl text-muted-foreground">O modo clássico 50/50.</p>

            {!walletAddress && (
              <Button
                onClick={() => setShowWalletModal(true)}
                className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-8"
              >
                Conectar Carteira
              </Button>
            )}

            {walletAddress && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-sm text-foreground font-mono">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}
                </p>
              </div>
            )}
          </div>

          <Tabs value={mode} onValueChange={(v) => setMode(v as 'solo' | 'multiplayer')} className="mb-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-card">
              <TabsTrigger value="solo">Solo</TabsTrigger>
              <TabsTrigger value="multiplayer">Multiplayer 1v1</TabsTrigger>
            </TabsList>

            <TabsContent value="solo" className="mt-8">
              <Card className="bg-card border border-border p-8 max-w-2xl mx-auto">
                <div className="text-center mb-6">
                  <label className="text-foreground font-semibold block mb-2">Valor da Aposta</label>
                  <div className="relative inline-block">
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val >= 0.1 && val <= 1000) {
                          setBetAmount(e.target.value);
                        }
                      }}
                      disabled={isFlipping}
                      className="w-32 px-4 py-2 text-xl font-bold text-center bg-background border-2 border-primary rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      step="0.1"
                      min="0.1"
                      max="1000"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">SOL</span>
                  </div>
                </div>

                <div className="flex justify-center mb-8">
                  <CoinFlip3D
                    isFlipping={isFlipping}
                    result={result}
                  />
                </div>

                <div className="flex justify-center items-center gap-8">
                  <button
                    onClick={() => handleFlip('heads')}
                    disabled={isFlipping}
                    className={`group relative ${isFlipping ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <div className={`w-32 h-32 rounded-full overflow-hidden border-4 transition-all duration-300 ${
                      selectedSide === 'heads'
                        ? 'border-primary shadow-[0_0_30px_rgba(0,255,255,0.8)] scale-110'
                        : 'border-border group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]'
                    }`}>
                      <img
                        src={gokuCoin}
                        alt="Heads - Goku"
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-lg font-bold text-primary">HEADS</span>
                    </div>
                  </button>

                  <div className="text-3xl font-bold text-muted-foreground">VS</div>

                  <button
                    onClick={() => handleFlip('tails')}
                    disabled={isFlipping}
                    className={`group relative ${isFlipping ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <div className={`w-32 h-32 rounded-full overflow-hidden border-4 transition-all duration-300 ${
                      selectedSide === 'tails'
                        ? 'border-secondary shadow-[0_0_30px_rgba(255,0,255,0.8)] scale-110'
                        : 'border-border group-hover:border-secondary group-hover:shadow-[0_0_20px_rgba(255,0,255,0.5)]'
                    }`}>
                      <img
                        src={vegetaCoin}
                        alt="Tails - Vegeta"
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-lg font-bold text-secondary">TAILS</span>
                    </div>
                  </button>
                </div>

                {result && !isFlipping && (
                  <div className="mt-12 text-center animate-fade-in">
                    <div className="bg-primary/10 border-2 border-primary rounded-xl p-6 inline-block">
                      <p className="text-2xl font-bold text-foreground mb-2">
                        🏆 RESULTADO
                      </p>
                      <p className="text-4xl font-bold text-primary">
                        {result === 'heads' ? 'HEADS (Goku)' : 'TAILS (Vegeta)'}
                      </p>
                      {selectedSide === result && (
                        <p className="text-xl font-bold text-green-400 mt-2">
                          +{parseFloat(betAmount) * 2} SOL
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="multiplayer" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-card border border-border p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Coins className="w-5 h-5 text-primary" />
                    Criar Jogo
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="text-foreground text-sm block mb-2">Valor da Aposta</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={betAmount}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= 0.1 && val <= 1000) {
                              setBetAmount(e.target.value);
                            }
                          }}
                          className="w-full px-4 py-3 bg-background text-foreground border-2 border-border rounded-lg focus:border-primary focus:outline-none"
                          step="0.1"
                          min="0.1"
                          max="1000"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">SOL</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-foreground text-sm block mb-2">Escolha seu lado</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setSelectedSide('heads')}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedSide === 'heads'
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <img src={gokuCoin} alt="Heads" className="w-12 h-12 mx-auto mb-1" />
                          <span className="text-foreground text-xs font-semibold">HEADS</span>
                        </button>
                        <button
                          onClick={() => setSelectedSide('tails')}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedSide === 'tails'
                              ? 'border-secondary bg-secondary/10'
                              : 'border-border hover:border-secondary/50'
                          }`}
                        >
                          <img src={vegetaCoin} alt="Tails" className="w-12 h-12 mx-auto mb-1" />
                          <span className="text-foreground text-xs font-semibold">TAILS</span>
                        </button>
                      </div>
                    </div>

                    <Button
                      onClick={handleCreateRoom}
                      disabled={!selectedSide}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                    >
                      Criar
                    </Button>
                  </div>
                  </Card>

                  <Card className="bg-card border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      TODOS OS JOGOS
                      <span className="text-base text-muted-foreground ml-2">{rooms.length}</span>
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Ordenar por: Alto a Baixo</span>
                      <span>Quantidade: Todo</span>
                    </div>
                  </div>

                  {roomsLoading ? (
                    <p className="text-foreground text-center py-8">Carregando salas...</p>
                  ) : rooms.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-foreground text-lg mb-2">Nenhum jogo disponível</p>
                      <p className="text-muted-foreground">Crie um jogo para começar!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {rooms.map((room) => (
                        <div
                          key={room.id}
                          className="bg-background border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary/50 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                              <img
                                src={room.creator_side === 'heads' ? gokuCoin : vegetaCoin}
                                alt={room.creator_side}
                                className="w-10 h-10 rounded-full"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-foreground font-bold">{room.bet_amount} SOL</span>
                                <span className="text-xs text-muted-foreground">
                                  {room.creator_wallet.slice(0, 4)}...{room.creator_wallet.slice(-4)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                                  {room.creator_side === 'heads' ? 'HEADS' : 'TAILS'}
                                </span>
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Espera...</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleJoinRoom(room.id)}
                            disabled={room.creator_wallet === walletAddress}
                            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold"
                          >
                            {room.creator_wallet === walletAddress ? 'Sua Sala' : 'Juntar'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  </Card>
                </div>

                <div className="lg:col-span-1">
                  <ChatBox roomId={activeRoomId} walletAddress={walletAddress} />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {walletAddress && history.length > 0 && (
            <Card className="bg-card border border-border p-6 mt-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Histórico de Partidas</h2>

              <div className="space-y-2">
                {history.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border-2 ${
                      item.won
                        ? 'bg-green-500/5 border-green-500/20'
                        : 'bg-red-500/5 border-red-500/20'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.chosen_side === 'heads' ? gokuCoin : vegetaCoin}
                          alt={item.chosen_side}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <span className="text-foreground font-semibold">
                            {item.bet_amount} SOL - {item.chosen_side === 'heads' ? 'HEADS' : 'TAILS'}
                          </span>
                          <span className="text-muted-foreground text-sm ml-2">
                            Resultado: {item.result === 'heads' ? 'HEADS' : 'TAILS'}
                          </span>
                        </div>
                      </div>
                      <div className={`font-bold text-lg ${item.won ? 'text-green-400' : 'text-red-400'}`}>
                        {item.won ? `+${item.bet_amount * 2}` : `-${item.bet_amount}`} SOL
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
