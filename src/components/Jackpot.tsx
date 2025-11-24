import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles } from "lucide-react";
import gogetaGif from "@/assets/gogeta.gif";

export const Jackpot = () => {
  return (
    <Card className="bg-gradient-to-br from-primary/20 via-card to-secondary/20 border-primary/50 p-8 relative overflow-hidden">
      {/* Animated aura background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/10 to-transparent animate-[pulse_3s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-l from-secondary/10 to-transparent animate-[pulse_3s_ease-in-out_infinite_1.5s]" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
        <Badge className="bg-gradient-to-r from-primary to-secondary text-white font-bold px-6 py-2 text-lg animate-pulse shadow-lg shadow-primary/50">
          <Sparkles className="w-4 h-4 mr-2 inline" />
          💎 JACKPOT DRAGON BALL
          <Sparkles className="w-4 h-4 ml-2 inline" />
        </Badge>

        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary blur-xl opacity-50 animate-pulse" />
          <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center animate-spin-slow shadow-2xl shadow-primary/50">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse">
              <Gift className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-3">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-pulse">
            Prêmio em SOL
          </h3>
          <p className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            $2.000,00
          </p>
          <p className="text-sm text-muted-foreground">Transforme-se em um Super Saiyajin da sorte!</p>
        </div>

        <div className="w-full max-w-md relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl" />
          <img 
            src={gogetaGif} 
            alt="Jackpot Animation" 
            className="relative w-full h-auto rounded-lg border-2 border-primary/50 shadow-2xl shadow-primary/30"
          />
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
    </Card>
  );
};
