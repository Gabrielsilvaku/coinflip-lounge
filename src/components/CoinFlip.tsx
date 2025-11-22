import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Coins } from "lucide-react";

interface Game {
  id: string;
  player: string;
  avatar: string;
  level: number;
  amount: number;
  status: "waiting" | "playing";
}

const mockGames: Game[] = [
  {
    id: "1",
    player: "FZERF",
    avatar: "👤",
    level: 15,
    amount: 0.138,
    status: "waiting",
  },
  {
    id: "2",
    player: "Stack21...",
    avatar: "🎮",
    level: 4,
    amount: 0.02,
    status: "waiting",
  },
  {
    id: "3",
    player: "B0Z0",
    avatar: "🎯",
    level: 59,
    amount: 0.009,
    status: "waiting",
  },
];

export const CoinFlip = () => {
  const [games] = useState<Game[]>(mockGames);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">COINFLIP</h2>
          <p className="text-muted-foreground">O modo clássico 50/50.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8">
          Criar
        </Button>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">TODOS OS</span>
          <span className="text-foreground font-bold">JOGOS</span>
          <Badge variant="secondary" className="bg-secondary">
            {games.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-primary">
          <div className="w-2 h-2 bg-primary rounded-full" />
          <span>Os pagamentos são liquidados no prazo de prescrição</span>
        </div>
      </div>

      <div className="space-y-3">
        {games.map((game) => (
          <Card
            key={game.id}
            className="bg-game-card hover:bg-game-card-hover border-border transition-all duration-300 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl">
                    {game.avatar}
                  </div>
                  <Badge className="absolute -top-1 -right-1 bg-neon-purple text-xs px-1.5 py-0">
                    {game.level}
                  </Badge>
                </div>
                <span className="text-foreground font-medium">{game.player}</span>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Coins className="w-4 h-4" />
                  <span className="text-sm">1</span>
                  <span className="text-sm">Espera...</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded">
                  <Coins className="w-4 h-4 text-neon-cyan" />
                  <span className="text-foreground font-bold">{game.amount}</span>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                  Juntar
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Eye className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
