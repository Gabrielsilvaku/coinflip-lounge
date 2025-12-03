import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MusicPlayer } from "@/components/MusicPlayer";
import { FloatingChat } from "@/components/FloatingChat";
import { WalletProvider } from "@/contexts/WalletContext";
import { useWallet } from "@/contexts/WalletContext";
import Home from "./pages/Home";
import Rifa from "./pages/Rifa";
import Coinflip from "./pages/Coinflip";
import Bolada from "./pages/Bolada";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import RaffleEnhanced from "./pages/RaffleEnhanced";
import NotFound from "./pages/NotFound";
import { OWNER_WALLET } from "@/lib/config";

const queryClient = new QueryClient();

const AppContent = () => {
  const { walletAddress } = useWallet();
  
  return (
    <>
      <Toaster />
      <Sonner />
      <MusicPlayer />
      <FloatingChat walletAddress={walletAddress} />
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/rifa" element={<Rifa />} />
            <Route path="/coinflip" element={<Coinflip />} />
            <Route path="/bolada" element={<Bolada />} />
            {walletAddress === OWNER_WALLET && (<Route path="/admin" element={<Admin />} />)}
            <Route path="/raffle" element={<RaffleEnhanced />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
