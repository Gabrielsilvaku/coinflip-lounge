import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Edit2, Save, X, Trophy, TrendingUp, TrendingDown, Coins } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserLevel } from "@/hooks/useUserLevel";
import { useUserStats } from "@/hooks/useUserStats";

interface ProfileMenuProps {
  walletAddress: string;
  onClose: () => void;
}

export const ProfileMenu = ({ walletAddress, onClose }: ProfileMenuProps) => {
  const { profile, updateProfile, getDisplayName } = useUserProfile(walletAddress);
  const { userLevel } = useUserLevel(walletAddress);
  const { stats, loading: statsLoading } = useUserStats(walletAddress);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(profile?.display_name || '');

  const handleSave = async () => {
    if (newName.trim()) {
      await updateProfile(newName.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm overflow-y-auto">
      <Card className="bg-card border-2 border-primary/50 p-6 max-w-2xl w-full mx-4 my-8 relative">
        <Button
          onClick={onClose}
          size="icon"
          variant="ghost"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="text-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center border-4 border-background shadow-lg">
            <User className="w-12 h-12 text-primary-foreground" />
          </div>

          {isEditing ? (
            <div className="flex items-center gap-2 justify-center">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Seu nome"
                className="max-w-[200px] bg-background text-foreground border-primary/50"
                maxLength={20}
              />
              <Button
                onClick={handleSave}
                size="icon"
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 justify-center">
              <h2 className="text-2xl font-bold text-foreground">{getDisplayName()}</h2>
              <Button
                onClick={() => {
                  setNewName(profile?.display_name || '');
                  setIsEditing(true);
                }}
                size="icon"
                variant="ghost"
                className="text-primary hover:text-primary/80"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground font-mono mt-2">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
        </div>

        {/* Level Section */}
        <div className="space-y-4 mb-6">
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Transformação DBZ</span>
              <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                Nível {userLevel.level}
              </Badge>
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {userLevel.transformation || 'Base Form'}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">XP Total</span>
              <span className="font-bold text-foreground">{Math.floor(userLevel.xp)}</span>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Estatísticas de Jogo
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background/50 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-4 h-4 text-primary" />
                <p className="text-xs text-muted-foreground">Total Apostado</p>
              </div>
              <p className="text-lg font-bold text-primary">
                {statsLoading ? '...' : stats.total_wagered.toFixed(4)} SOL
              </p>
            </div>

            <div className="bg-background/50 border border-secondary/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-secondary" />
                <p className="text-xs text-muted-foreground">Total de Apostas</p>
              </div>
              <p className="text-lg font-bold text-secondary">
                {statsLoading ? '...' : stats.total_bets}
              </p>
            </div>

            <div className="bg-background/50 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <p className="text-xs text-muted-foreground">Total Ganho</p>
              </div>
              <p className="text-lg font-bold text-green-500">
                {statsLoading ? '...' : stats.total_won.toFixed(4)} SOL
              </p>
            </div>

            <div className="bg-background/50 border border-red-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <p className="text-xs text-muted-foreground">Total Perdido</p>
              </div>
              <p className="text-lg font-bold text-red-500">
                {statsLoading ? '...' : stats.total_lost.toFixed(4)} SOL
              </p>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between bg-background/50 border border-border rounded-lg p-3">
              <span className="text-sm text-muted-foreground">CoinFlip</span>
              <div className="flex gap-2">
                <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                  {statsLoading ? '...' : stats.coinflip_wins}V
                </Badge>
                <Badge className="bg-red-500/20 text-red-500 border-red-500/50">
                  {statsLoading ? '...' : stats.coinflip_losses}D
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between bg-background/50 border border-border rounded-lg p-3">
              <span className="text-sm text-muted-foreground">Jackpot</span>
              <div className="flex gap-2">
                <Badge className="bg-secondary/20 text-secondary border-secondary/50">
                  {statsLoading ? '...' : stats.jackpot_participations} apostas
                </Badge>
                <Badge className="bg-primary/20 text-primary border-primary/50">
                  {statsLoading ? '...' : stats.jackpot_wins} vitórias
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={onClose}
          className="w-full mt-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground"
        >
          Fechar Perfil
        </Button>
      </Card>
    </div>
  );
};
