import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Wallet, Settings } from "lucide-react";

export const Header = () => {
  return (
    <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">⚡</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-wider">
                COINFLIP
              </h1>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Valor da Aposta -</span>
              <span className="text-foreground font-bold">$0</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-lg">
              <Coins className="w-5 h-5 text-neon-cyan" />
              <span className="text-foreground font-bold">0</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="bg-secondary hover:bg-secondary/80 text-foreground"
            >
              +0.1
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="bg-secondary hover:bg-secondary/80 text-foreground"
            >
              +1
            </Button>

            <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple/50 px-3 py-2">
              <Coins className="w-4 h-4 mr-1" />
            </Badge>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-5 h-5" />
            </Button>

            <Button className="bg-gradient-to-r from-neon-purple to-neon-cyan hover:opacity-90 text-white font-bold px-6">
              <Wallet className="w-4 h-4 mr-2" />
              Conectar Carteira
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
