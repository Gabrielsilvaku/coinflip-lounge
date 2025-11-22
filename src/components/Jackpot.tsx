import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift } from "lucide-react";
import gogetaGif from "@/assets/gogeta.gif";

export const Jackpot = () => {
  return (
    <Card className="bg-gradient-to-br from-game-card to-game-card-hover border-neon-cyan/30 p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 to-transparent" />
      
      <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
        <Badge className="bg-neon-cyan text-background font-bold px-4 py-1">
          💎 cripto
        </Badge>

        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple/50 flex items-center justify-center animate-pulse shadow-lg shadow-neon-cyan/50">
          <Gift className="w-16 h-16 text-background" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-foreground">Prêmio em SOL</h3>
          <p className="text-4xl font-bold text-neon-cyan">$2.000,00</p>
        </div>

        <div className="w-full max-w-md">
          <img 
            src={gogetaGif} 
            alt="Jackpot Animation" 
            className="w-full h-auto rounded-lg"
          />
        </div>
      </div>
    </Card>
  );
};
