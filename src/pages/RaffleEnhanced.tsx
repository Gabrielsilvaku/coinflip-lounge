import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/contexts/WalletContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Ticket, Trophy, Users } from 'lucide-react';
import gogetaGif from '@/assets/gogeta.gif';

export default function RaffleEnhanced() {
  const { walletAddress } = useWallet();
  const [ticketCount, setTicketCount] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);
  const [myTickets, setMyTickets] = useState<number[]>([]);
  const [winner, setWinner] = useState<any>(null);

  useEffect(() => {
    fetchRaffleData();
    subscribeToUpdates();
  }, [walletAddress]);

  const fetchRaffleData = async () => {
    try {
      const [tickets, winnerData, myTicketsData] = await Promise.all([
        supabase.from('raffle_tickets').select('*', { count: 'exact', head: true }),
        supabase.from('raffle_winners').select('*').eq('raffle_id', 'main').order('won_at', { ascending: false }).limit(1).single(),
        walletAddress 
          ? supabase.from('raffle_tickets').select('ticket_number').eq('wallet_address', walletAddress).eq('raffle_id', 'main')
          : null
      ]);

      setTotalTickets(tickets.count || 0);
      if (winnerData.data) setWinner(winnerData.data);
      if (myTicketsData?.data) setMyTickets(myTicketsData.data.map(t => t.ticket_number));
    } catch (error) {
      console.error('Error fetching raffle data:', error);
    }
  };

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel('raffle_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raffle_tickets' }, fetchRaffleData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raffle_winners' }, fetchRaffleData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const buyTickets = async () => {
    if (!walletAddress) {
      toast.error('Conecte sua carteira primeiro');
      return;
    }

    try {
      // Gerar números de tickets únicos
      const ticketsToInsert = [];
      for (let i = 0; i < ticketCount; i++) {
        const ticketNumber = totalTickets + i + 1;
        ticketsToInsert.push({
          wallet_address: walletAddress,
          ticket_number: ticketNumber,
          raffle_id: 'main'
        });
      }

      const { error } = await supabase
        .from('raffle_tickets')
        .insert(ticketsToInsert);

      if (error) throw error;

      toast.success(`${ticketCount} ticket(s) comprado(s) com sucesso!`);
      setTicketCount(1);
    } catch (error) {
      console.error('Error buying tickets:', error);
      toast.error('Erro ao comprar tickets');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            🎰 RIFA DRAGON BALL - $2.000 USD 🎰
          </h1>
          <p className="text-muted-foreground">Compre seus tickets e concorra ao grande prêmio!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-primary/30">
            <div className="flex items-center gap-3 mb-4">
              <Ticket className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Comprar Tickets</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Quantidade de Tickets
                </label>
                <Input
                  type="number"
                  min="1"
                  value={ticketCount}
                  onChange={(e) => setTicketCount(parseInt(e.target.value) || 1)}
                  className="text-lg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Preço por ticket: 0.1 SOL
                </p>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    {(ticketCount * 0.1).toFixed(2)} SOL
                  </span>
                </div>
              </div>

              <Button 
                onClick={buyTickets}
                disabled={!walletAddress}
                className="w-full h-12 text-lg"
              >
                {walletAddress ? 'Comprar Tickets' : 'Conecte sua Carteira'}
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-secondary/30">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-secondary" />
              <h2 className="text-2xl font-bold">Estatísticas</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total de Tickets Vendidos</p>
                <p className="text-3xl font-bold text-primary">{totalTickets}</p>
              </div>

              {myTickets.length > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Seus Tickets</p>
                  <div className="flex flex-wrap gap-2">
                    {myTickets.map((ticket) => (
                      <Badge key={ticket} className="bg-primary text-white">
                        #{ticket}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {winner && (
                <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-amber-600/20 rounded-lg border border-yellow-500/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <p className="font-bold text-yellow-500">Último Vencedor</p>
                  </div>
                  <p className="text-sm font-mono">
                    {winner.wallet_address.slice(0, 8)}...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ticket #{winner.ticket_number}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
          <div className="text-center mb-6">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              PRÊMIO: $2.000 USD EM SOL
            </h3>
            <p className="text-muted-foreground">
              O vencedor será selecionado pelo administrador PRINCEM
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <img 
              src={gogetaGif} 
              alt="Rifa Dragon Ball" 
              className="w-full h-auto rounded-lg shadow-2xl border-2 border-primary/50"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
