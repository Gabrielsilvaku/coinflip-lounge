import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdmin } from '@/hooks/useAdmin';
import { useWallet } from '@/contexts/WalletContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, Ban, MessageSquareOff, Settings, Trophy, Activity, Wallet } from 'lucide-react';

export default function Admin() {
  const { walletAddress } = useWallet();
  const { isAdmin, loading, banUser, unbanUser, muteUser, unmuteUser, updateHouseEdge, selectRaffleWinner } = useAdmin(walletAddress);
  
  const [targetWallet, setTargetWallet] = useState('');
  const [banReason, setBanReason] = useState('');
  const [muteReason, setMuteReason] = useState('');
  const [muteDuration, setMuteDuration] = useState(10);
  const [houseEdge, setHouseEdge] = useState(3.5);
  const [raffleTicket, setRaffleTicket] = useState('');
  const [raffleWallet, setRaffleWallet] = useState('');
  const [treasuryWallet, setTreasuryWallet] = useState('');
  
  const [bannedUsers, setBannedUsers] = useState<any[]>([]);
  const [mutedUsers, setMutedUsers] = useState<any[]>([]);
  const [activeRooms, setActiveRooms] = useState<any[]>([]);
  const [raffleTickets, setRaffleTickets] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
      subscribeToUpdates();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      const [banned, muted, rooms, tickets, actionLogs, settings, treasury] = await Promise.all([
        supabase.from('banned_users').select('*').order('banned_at', { ascending: false }),
        supabase.from('muted_users').select('*').order('created_at', { ascending: false }),
        supabase.from('coinflip_rooms').select('*').in('status', ['waiting', 'playing']),
        supabase.from('raffle_tickets').select('*').order('purchased_at', { ascending: false }).limit(100),
        supabase.from('action_logs').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('game_settings').select('*').eq('setting_key', 'house_edge').single(),
        supabase.from('treasury_config').select('*').single()
      ]);

      if (banned.data) setBannedUsers(banned.data);
      if (muted.data) setMutedUsers(muted.data);
      if (rooms.data) setActiveRooms(rooms.data);
      if (tickets.data) setRaffleTickets(tickets.data);
      if (actionLogs.data) setLogs(actionLogs.data);
      if (settings.data) setHouseEdge(parseFloat(settings.data.setting_value));
      if (treasury.data) setTreasuryWallet(treasury.data.wallet_address);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel('admin_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banned_users' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'muted_users' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coinflip_rooms' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raffle_tickets' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h1>
            <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Painel Admin - PRINCEM</h1>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">M MAJIN</Badge>
        </div>

        <Tabs defaultValue="moderation" className="space-y-4">
          <TabsList className="bg-card">
            <TabsTrigger value="moderation">
              <Ban className="w-4 h-4 mr-2" />
              Moderação
            </TabsTrigger>
            <TabsTrigger value="games">
              <Activity className="w-4 h-4 mr-2" />
              Jogos Ativos
            </TabsTrigger>
            <TabsTrigger value="raffle">
              <Trophy className="w-4 h-4 mr-2" />
              Rifa
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="moderation" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Ban className="w-5 h-5" />
                Banir Usuário
              </h2>
              <div className="space-y-3">
                <Input
                  placeholder="Endereço da carteira"
                  value={targetWallet}
                  onChange={(e) => setTargetWallet(e.target.value)}
                />
                <Input
                  placeholder="Motivo do banimento"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
                <Button onClick={() => banUser(targetWallet, banReason)} className="w-full">
                  Banir Usuário
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageSquareOff className="w-5 h-5" />
                Silenciar Usuário
              </h2>
              <div className="space-y-3">
                <Input
                  placeholder="Endereço da carteira"
                  value={targetWallet}
                  onChange={(e) => setTargetWallet(e.target.value)}
                />
                <Input
                  placeholder="Motivo"
                  value={muteReason}
                  onChange={(e) => setMuteReason(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Duração (minutos)"
                  value={muteDuration}
                  onChange={(e) => setMuteDuration(parseInt(e.target.value))}
                />
                <Button onClick={() => muteUser(targetWallet, muteReason, muteDuration)} className="w-full">
                  Silenciar
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-3">Usuários Banidos ({bannedUsers.length})</h3>
              <div className="space-y-2">
                {bannedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded">
                    <div>
                      <p className="font-mono text-sm">{user.wallet_address.slice(0, 8)}...</p>
                      <p className="text-xs text-muted-foreground">{user.reason}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => unbanUser(user.wallet_address)}>
                      Desbanir
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-3">Usuários Silenciados ({mutedUsers.length})</h3>
              <div className="space-y-2">
                {mutedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded">
                    <div>
                      <p className="font-mono text-sm">{user.wallet_address.slice(0, 8)}...</p>
                      <p className="text-xs text-muted-foreground">{user.reason}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => unmuteUser(user.wallet_address)}>
                      Desmutar
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="games">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Salas Ativas de Coinflip</h2>
              <div className="space-y-3">
                {activeRooms.map((room) => (
                  <div key={room.id} className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <Badge>{room.status}</Badge>
                        <p className="text-sm mt-2">Criador: {room.creator_wallet.slice(0, 8)}...</p>
                        {room.joiner_wallet && (
                          <p className="text-sm">Oponente: {room.joiner_wallet.slice(0, 8)}...</p>
                        )}
                        <p className="text-sm">Aposta: {room.bet_amount} SOL</p>
                      </div>
                    </div>
                  </div>
                ))}
                {activeRooms.length === 0 && (
                  <p className="text-center text-muted-foreground">Nenhuma sala ativa</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="raffle" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Selecionar Vencedor da Rifa</h2>
              <div className="space-y-3">
                <Input
                  type="number"
                  placeholder="Número do ticket"
                  value={raffleTicket}
                  onChange={(e) => setRaffleTicket(e.target.value)}
                />
                <Input
                  placeholder="Endereço da carteira do vencedor"
                  value={raffleWallet}
                  onChange={(e) => setRaffleWallet(e.target.value)}
                />
                <Button 
                  onClick={() => selectRaffleWinner(parseInt(raffleTicket), raffleWallet)}
                  className="w-full"
                >
                  Selecionar Vencedor
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-3">Tickets Vendidos ({raffleTickets.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                {raffleTickets.map((ticket) => (
                  <div key={ticket.id} className="p-2 bg-muted rounded text-sm">
                    <span className="font-bold">#{ticket.ticket_number}</span> - {ticket.wallet_address.slice(0, 8)}...
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Carteira da Casa (Treasury)</h2>
              <div className="space-y-3">
                <Input
                  placeholder="Endereço da carteira Solana"
                  value={treasuryWallet}
                  onChange={(e) => setTreasuryWallet(e.target.value)}
                />
                <Button 
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('treasury_config')
                        .update({ wallet_address: treasuryWallet })
                        .eq('wallet_address', treasuryWallet);
                      
                      if (error) throw error;
                      toast.success('Carteira atualizada!');
                    } catch (error) {
                      console.error('Error updating treasury:', error);
                      toast.error('Erro ao atualizar carteira');
                    }
                  }}
                  className="w-full"
                >
                  Atualizar Carteira da Casa
                </Button>
                <p className="text-xs text-muted-foreground">
                  Esta carteira receberá as taxas de 3.5% de todas as apostas
                </p>
              </div>
            </Card>

            <Card className="p-6 mt-4">
              <h2 className="text-xl font-bold mb-4">Taxa da Casa</h2>
              <div className="space-y-3">
                <Input
                  type="number"
                  step="0.1"
                  value={houseEdge}
                  onChange={(e) => setHouseEdge(parseFloat(e.target.value))}
                />
                <Button onClick={() => updateHouseEdge(houseEdge)} className="w-full">
                  Atualizar Taxa ({houseEdge}%)
                </Button>
              </div>
            </Card>

            <Card className="p-6 mt-4">
              <h3 className="font-bold mb-3">Logs de Ações ({logs.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 bg-muted rounded text-sm">
                    <div className="flex justify-between">
                      <Badge variant="outline">{log.action_type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    {log.target_wallet && (
                      <p className="mt-1 font-mono">{log.target_wallet.slice(0, 16)}...</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
