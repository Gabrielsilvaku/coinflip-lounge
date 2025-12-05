import { User } from 'lucide-react';

interface AuraAvatarProps {
  avatarUrl?: string | null;
  level: number;
  transformation?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Aura colors based on DBZ transformations
const AURA_STYLES: Record<string, { glow: string; border: string; animation: string }> = {
  'Base Form': { 
    glow: 'shadow-[0_0_8px_rgba(100,100,100,0.5)]', 
    border: 'border-gray-500', 
    animation: '' 
  },
  'SSJ1': { 
    glow: 'shadow-[0_0_15px_rgba(255,215,0,0.8)]', 
    border: 'border-yellow-400', 
    animation: 'animate-pulse' 
  },
  'SSJ2': { 
    glow: 'shadow-[0_0_20px_rgba(255,200,0,0.9)]', 
    border: 'border-yellow-500', 
    animation: 'animate-pulse' 
  },
  'SSJ3': { 
    glow: 'shadow-[0_0_25px_rgba(255,180,0,1)]', 
    border: 'border-amber-500', 
    animation: 'animate-pulse' 
  },
  'Mystic': { 
    glow: 'shadow-[0_0_20px_rgba(200,200,200,0.9)]', 
    border: 'border-gray-300', 
    animation: 'animate-pulse' 
  },
  'Majin Vegeta': { 
    glow: 'shadow-[0_0_20px_rgba(255,100,100,0.8)]', 
    border: 'border-red-500', 
    animation: 'animate-pulse' 
  },
  'SSJ4': { 
    glow: 'shadow-[0_0_25px_rgba(255,50,50,0.9)]', 
    border: 'border-red-600', 
    animation: 'animate-pulse' 
  },
  'SSJ God': { 
    glow: 'shadow-[0_0_25px_rgba(255,80,80,0.9)]', 
    border: 'border-rose-500', 
    animation: 'animate-pulse' 
  },
  'SSJ Blue': { 
    glow: 'shadow-[0_0_25px_rgba(0,150,255,0.9)]', 
    border: 'border-cyan-400', 
    animation: 'animate-pulse' 
  },
  'SSJ Blue KKx20': { 
    glow: 'shadow-[0_0_30px_rgba(255,0,100,0.9),0_0_60px_rgba(0,150,255,0.6)]', 
    border: 'border-pink-500', 
    animation: 'animate-pulse' 
  },
  'SSJ Blue Evolved': { 
    glow: 'shadow-[0_0_30px_rgba(0,100,255,1)]', 
    border: 'border-blue-500', 
    animation: 'animate-pulse' 
  },
  'Ultra Instinct': { 
    glow: 'shadow-[0_0_35px_rgba(150,180,255,1),0_0_70px_rgba(200,200,255,0.5)]', 
    border: 'border-indigo-300', 
    animation: 'animate-pulse' 
  },
  'Complete UI': { 
    glow: 'shadow-[0_0_40px_rgba(220,220,255,1),0_0_80px_rgba(255,255,255,0.6)]', 
    border: 'border-white', 
    animation: 'animate-pulse' 
  },
  'Ultra Ego': { 
    glow: 'shadow-[0_0_30px_rgba(150,0,255,0.9)]', 
    border: 'border-purple-500', 
    animation: 'animate-pulse' 
  },
  'Beast Form': { 
    glow: 'shadow-[0_0_30px_rgba(255,100,150,0.9)]', 
    border: 'border-pink-400', 
    animation: 'animate-pulse' 
  },
  'Orange Piccolo': { 
    glow: 'shadow-[0_0_25px_rgba(255,150,0,0.9)]', 
    border: 'border-orange-500', 
    animation: 'animate-pulse' 
  },
  'Legendary SSJ': { 
    glow: 'shadow-[0_0_30px_rgba(100,255,100,0.9)]', 
    border: 'border-green-400', 
    animation: 'animate-pulse' 
  },
  'God of Destruction': { 
    glow: 'shadow-[0_0_35px_rgba(200,0,255,1),0_0_70px_rgba(255,0,255,0.5)]', 
    border: 'border-fuchsia-500', 
    animation: 'animate-pulse' 
  },
};

const getAuraStyle = (transformation: string | null | undefined) => {
  if (!transformation) return AURA_STYLES['Base Form'];
  return AURA_STYLES[transformation] || AURA_STYLES['Base Form'];
};

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-24 h-24',
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-12 h-12',
};

export const AuraAvatar = ({ 
  avatarUrl, 
  level, 
  transformation, 
  size = 'md',
  className = ''
}: AuraAvatarProps) => {
  const auraStyle = getAuraStyle(transformation);
  const showAura = level > 0;

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Aura ring effect */}
      {showAura && (
        <div 
          className={`absolute inset-[-4px] rounded-full ${auraStyle.glow} ${auraStyle.animation} opacity-80`}
          style={{ filter: 'blur(2px)' }}
        />
      )}
      
      {/* Avatar container */}
      <div 
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-2 ${
          showAura ? auraStyle.border : 'border-muted'
        } bg-gradient-to-br from-card to-muted flex items-center justify-center ${auraStyle.animation}`}
      >
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        ) : (
          <User className={`${iconSizes[size]} text-muted-foreground`} />
        )}
      </div>
    </div>
  );
};
