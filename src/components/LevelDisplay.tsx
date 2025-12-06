import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp } from 'lucide-react';
import { useUserLevel } from '@/hooks/useUserLevel';
import { AuraAvatar } from './AuraAvatar';

interface LevelDisplayProps {
  walletAddress: string | null;
}

// XP needed per level (exponential scaling)
const getXPForLevel = (level: number) => {
  return Math.floor(100 * Math.pow(1.2, level));
};

export const LevelDisplay = ({ walletAddress }: LevelDisplayProps) => {
  const { userLevel, getTransformation, getNextTransformation, getProgressToNextLevel } = useUserLevel(walletAddress);
  
  if (!walletAddress || !userLevel) return null;

  const currentTransformation = getTransformation();
  const nextTransformation = getNextTransformation();
  const progress = getProgressToNextLevel();
  
  // Calculate XP needed for next level
  const currentLevelXP = getXPForLevel(userLevel.level);
  const nextLevelXP = getXPForLevel(userLevel.level + 1);
  const currentXP = userLevel.xp || 0;
  const xpInCurrentLevel = currentXP - currentLevelXP;
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
  const xpRemaining = Math.max(0, nextLevelXP - currentXP);

  return (
    <Card className="bg-gradient-to-r from-card/90 to-card/70 border-primary/20 backdrop-blur-sm px-4 py-2.5 flex items-center gap-4">
      <AuraAvatar
        level={userLevel.level}
        transformation={currentTransformation?.name}
        size="sm"
      />
      
      <div className="flex flex-col flex-1 min-w-[140px]">
        {/* Level and Transformation */}
        <div className="flex items-center gap-2 mb-1">
          <Badge 
            className="bg-primary/20 text-primary border-primary/30 text-xs px-2 py-0.5 font-bold"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            LV {userLevel.level}
          </Badge>
          <span className="text-xs text-foreground font-medium truncate">
            {currentTransformation?.name || 'Base Form'}
          </span>
        </div>
        
        {/* XP Progress Bar */}
        <div className="flex items-center gap-2">
          <Progress value={progress} className="h-2 flex-1 bg-muted/50" />
          <span className="text-[10px] text-primary font-semibold whitespace-nowrap min-w-[50px] text-right">
            {userLevel.level < 100 ? `${xpRemaining.toLocaleString()} XP` : 'MAX'}
          </span>
        </div>
        
        {/* Next Transformation Preview */}
        {nextTransformation && userLevel.level < 100 && (
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-secondary" />
            <span className="text-[10px] text-secondary font-medium">
              Next: {nextTransformation.name}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
