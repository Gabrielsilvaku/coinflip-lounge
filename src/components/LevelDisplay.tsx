import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';
import { useUserLevel } from '@/hooks/useUserLevel';

interface LevelDisplayProps {
  walletAddress: string | null;
}

export const LevelDisplay = ({ walletAddress }: LevelDisplayProps) => {
  const { userLevel, getTransformation, getNextTransformation, getProgressToNextLevel } = useUserLevel(walletAddress);
  
  if (!walletAddress) return null;

  const currentTransformation = getTransformation();
  const nextTransformation = getNextTransformation();
  const progress = getProgressToNextLevel();

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-primary/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Nível {userLevel.level}</h3>
        </div>
        {currentTransformation && (
          <Badge className={`bg-gradient-to-r ${currentTransformation.color} text-white border-0`}>
            {currentTransformation.name}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">XP: {Math.floor(userLevel.xp)}</span>
          {nextTransformation && (
            <span className="text-primary text-xs">
              Próxima: {nextTransformation.name} (Nv. {nextTransformation.level})
            </span>
          )}
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="text-xs text-muted-foreground">
          Total apostado: {userLevel.total_wagered.toFixed(4)} SOL
        </div>
      </div>

      {currentTransformation && (
        <div className={`mt-3 p-2 rounded-lg bg-gradient-to-r ${currentTransformation.color} opacity-20 animate-pulse`} />
      )}
    </Card>
  );
};
