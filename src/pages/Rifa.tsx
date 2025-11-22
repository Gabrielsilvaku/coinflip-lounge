import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Gift, Ticket } from "lucide-react";
import gogetaGif from "@/assets/gogeta.gif";

const Rifa = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 7,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gift className="w-10 h-10 text-primary" />
              <h1 className="text-5xl font-bold text-foreground">RIFAS</h1>
              <Gift className="w-10 h-10 text-secondary" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-card border-2 border-border overflow-hidden hover:border-primary/50 transition-all">
              <div className="relative">
                <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 z-10">
                  <Ticket className="w-4 h-4" />
                  cripto
                </div>
                <div className="absolute top-3 right-3 bg-background/80 backdrop-blur text-foreground px-3 py-1 rounded-full text-sm font-bold z-10">
                  $2.000,00
                </div>

                <div className="h-64 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                  <img 
                    src={gogetaGif} 
                    alt="Jackpot Gogeta Animation" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent"></div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="text-sm text-foreground font-semibold">0</span>
                      <span className="text-xs text-muted-foreground">Espera...</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: '0%' }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-background/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center gap-2 text-center">
                    <Clock className="w-5 h-5 text-primary" />
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-2xl font-bold text-foreground">{timeLeft.days}</div>
                        <div className="text-xs text-muted-foreground">dias</div>
                      </div>
                      <span className="text-foreground">:</span>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{String(timeLeft.hours).padStart(2, '0')}</div>
                        <div className="text-xs text-muted-foreground">hrs</div>
                      </div>
                      <span className="text-foreground">:</span>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{String(timeLeft.minutes).padStart(2, '0')}</div>
                        <div className="text-xs text-muted-foreground">min</div>
                      </div>
                      <span className="text-foreground">:</span>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{String(timeLeft.seconds).padStart(2, '0')}</div>
                        <div className="text-xs text-muted-foreground">seg</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-foreground mb-1">$2,000</p>
                  <p className="text-sm text-muted-foreground">
                    Os pagamentos são liquidados no prazo de prescrição
                  </p>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-lg"
                  disabled
                >
                  Seja o primeiro!
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Nenhum participante ainda. Conecte sua carteira para participar!
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-card/50 border-2 border-dashed border-border p-6 flex items-center justify-center min-h-[500px]">
              <div className="text-center">
                <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground text-lg font-semibold mb-2">Em breve</p>
                <p className="text-muted-foreground text-sm">Mais rifas serão adicionadas</p>
              </div>
            </Card>

            <Card className="bg-card/50 border-2 border-dashed border-border p-6 flex items-center justify-center min-h-[500px]">
              <div className="text-center">
                <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground text-lg font-semibold mb-2">Em breve</p>
                <p className="text-muted-foreground text-sm">Mais rifas serão adicionadas</p>
              </div>
            </Card>
          </div>

          <Card className="bg-card border border-border p-6 mt-8">
            <h3 className="text-primary font-semibold mb-3 text-lg">Como funciona:</h3>
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Compre quantos bilhetes quiser para aumentar suas chances</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>O sorteio acontece automaticamente quando o tempo acabar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>O vencedor leva o prêmio total em SOL</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Conecte sua carteira Phantom, Solflare ou Coin98 para participar</span>
              </li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Rifa;
