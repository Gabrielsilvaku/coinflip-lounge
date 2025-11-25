import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles, Zap } from "lucide-react";
import gogetaGif from "@/assets/gogeta.gif";

export const Jackpot = () => {
  return (
    <Card className="bg-gradient-to-br from-primary/20 via-card to-secondary/20 border-primary/50 p-8 relative overflow-hidden">
      {/* Animated aura background with DBZ energy effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/10 to-transparent animate-[pulse_3s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-l from-secondary/10 to-transparent animate-[pulse_3s_ease-in-out_infinite_1.5s]" />
      </div>

      {/* Energy sparks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Zap className="absolute top-10 left-10 w-6 h-6 text-primary animate-spark-1 opacity-70" />
        <Zap className="absolute top-20 right-16 w-5 h-5 text-secondary animate-spark-2 opacity-60" />
        <Zap className="absolute bottom-24 left-20 w-4 h-4 text-primary animate-spark-3 opacity-80" />
        <Zap className="absolute bottom-10 right-10 w-6 h-6 text-secondary animate-spark-1 opacity-70" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
        <Badge className="bg-gradient-to-r from-primary to-secondary text-white font-bold px-6 py-2 text-lg animate-pulse shadow-lg shadow-primary/50">
          <Sparkles className="w-4 h-4 mr-2 inline animate-spin-slow" />
          💎 JACKPOT DRAGON BALL
          <Sparkles className="w-4 h-4 ml-2 inline animate-spin-slow" />
        </Badge>

        {/* Slot machine style spinning container */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary blur-2xl opacity-60 animate-pulse" />
          
          {/* Outer spinning ring */}
          <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center animate-spin-slot shadow-2xl shadow-primary/50 border-4 border-white/20">
            {/* Middle ring counter-spinning */}
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-secondary via-primary to-secondary flex items-center justify-center animate-spin-reverse border-4 border-white/30">
              {/* Inner core pulsing */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse-fast shadow-inner">
                <Gift className="w-12 h-12 text-white animate-bounce-slow" />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-3">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-pulse">
            Prêmio em SOL
          </h3>
          <p className="text-6xl font-bold bg-gradient-to-r from-primary via-white to-secondary bg-clip-text text-transparent animate-shimmer">
            $2.000,00
          </p>
          <p className="text-sm text-muted-foreground animate-pulse">Transforme-se em um Super Saiyajin da sorte!</p>
        </div>

        <div className="w-full max-w-md relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl animate-pulse" />
          <img 
            src={gogetaGif} 
            alt="Jackpot Animation" 
            className="relative w-full h-auto rounded-lg border-2 border-primary/50 shadow-2xl shadow-primary/30 hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-slot {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes pulse-fast {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes spark-1 {
          0%, 100% { opacity: 0; transform: translate(0, 0) scale(0.5); }
          50% { opacity: 1; transform: translate(10px, -10px) scale(1); }
        }
        
        @keyframes spark-2 {
          0%, 100% { opacity: 0; transform: translate(0, 0) scale(0.5); }
          50% { opacity: 1; transform: translate(-15px, 10px) scale(1); }
        }
        
        @keyframes spark-3 {
          0%, 100% { opacity: 0; transform: translate(0, 0) scale(0.5); }
          50% { opacity: 1; transform: translate(12px, 8px) scale(1); }
        }

        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        
        .animate-spin-slot {
          animation: spin-slot 3s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 4s linear infinite;
        }
        
        .animate-pulse-fast {
          animation: pulse-fast 2s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
        
        .animate-spark-1 {
          animation: spark-1 2s ease-in-out infinite;
        }
        
        .animate-spark-2 {
          animation: spark-2 2.5s ease-in-out infinite 0.5s;
        }
        
        .animate-spark-3 {
          animation: spark-3 3s ease-in-out infinite 1s;
        }
      `}</style>
    </Card>
  );
};
