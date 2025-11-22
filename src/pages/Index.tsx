import { Header } from "@/components/Header";
import { CoinFlip } from "@/components/CoinFlip";
import { Jackpot } from "@/components/Jackpot";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CoinFlip />
          </div>
          
          <div className="lg:col-span-1">
            <Jackpot />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
