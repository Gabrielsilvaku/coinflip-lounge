import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Edit2, Save, X } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserLevel } from '@/hooks/useUserLevel';

interface ProfileMenuProps {
  walletAddress: string;
  onClose: () => void;
}

export const ProfileMenu = ({ walletAddress, onClose }: ProfileMenuProps) => {
  const { profile, updateProfile, getDisplayName } = useUserProfile(walletAddress);
  const { userLevel } = useUserLevel(walletAddress);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(profile?.display_name || '');

  const handleSave = async () => {
    if (newName.trim()) {
      await updateProfile(newName.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="bg-card border-2 border-primary/50 p-6 max-w-md w-full mx-4 relative">
        <Button
          onClick={onClose}
          size="icon"
          variant="ghost"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center">
            <User className="w-10 h-10 text-primary-foreground" />
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
            {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-background/50 border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Nível DBZ</span>
              <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                Nível {userLevel.level}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-primary">
              {userLevel.transformation || 'Base'}
            </div>
          </div>

          <div className="bg-background/50 border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">XP Total</span>
              <span className="text-lg font-bold text-foreground">{Math.floor(userLevel.xp)}</span>
            </div>
          </div>

          <div className="bg-background/50 border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Apostado</span>
              <span className="text-lg font-bold text-secondary">
                {userLevel.total_wagered.toFixed(4)} SOL
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={onClose}
          className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Fechar
        </Button>
      </Card>
    </div>
  );
};
