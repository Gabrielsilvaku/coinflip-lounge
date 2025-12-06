import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, Star } from 'lucide-react';
import { useUserLevel } from '@/hooks/useUserLevel';
import { AuraAvatar } from './AuraAvatar';

interface LevelDisplayProps {
  walletAddress: string | null;
}

// XP needed per level
const XP_PER_LEVEL = 100;

export const LevelDisplay = ({ walletAddress }: LevelDisplayProps) => {
  const { userLevel, getTransformation, getNextTransformation, getProgressToNextLevel } = useUserLevel(walletAddress);
  
  if (!walletAddress || !userLevel) return null;

  const currentTransformation = getTransformation();
  const nextTransformation = getNextTransformation();
  const progress = getProgressToNextLevel();
  
  // Calculate XP needed for next level
  const nextLevelXP = (userLevel.level + 1) * XP_PER_LEVEL;
  const xpNeeded = Math.max(0, nextLevelXP - (userLevel.xp || 0));

  return (
    <Card className="bg-card/80 border-primary/30 px-3 py-2 flex items-center gap-3">
      <AuraAvatar
        level={userLevel.level}
        transformation={currentTransformation?.name}
        size="sm"
      />
      
      <div className="flex flex-col min-w-[120px]">
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className="text-[10px] px-1.5 py-0 border-primary text-primary"
          >
            <Star className="w-2.5 h-2.5 mr-0.5" />
            Lv.{userLevel.level}
          </Badge>
          <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
            {currentTransformation?.name || 'Base Form'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <Progress value={progress} className="h-1.5 flex-1" />
          <span className="text-[9px] text-muted-foreground whitespace-nowrap">
            {userLevel.level < 100 ? `${xpNeeded.toFixed(0)} XP` : 'MAX'}
          </span>
        </div>
        
        {nextTransformation && userLevel.level < 100 && (
          <div className="flex items-center gap-1 mt-0.5">
            <Zap className="w-2.5 h-2.5 text-secondary" />
            <span className="text-[9px] text-secondary truncate">
              → {nextTransformation.name}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
