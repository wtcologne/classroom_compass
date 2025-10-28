/**
 * Level Badge Component
 * Zeigt Level, Emoji und Fortschritt des Users an
 */

'use client';

import React from 'react';
import { getUserLevel, formatPoints } from '@/lib/gamification';
import { TrendingUp } from 'lucide-react';

interface LevelBadgeProps {
  points: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  showPoints?: boolean;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ 
  points, 
  size = 'md',
  showProgress = false,
  showPoints = true 
}) => {
  const levelInfo = getUserLevel(points);

  const sizeClasses = {
    sm: {
      container: 'text-xs',
      emoji: 'text-sm',
      badge: 'px-2 py-1',
    },
    md: {
      container: 'text-sm',
      emoji: 'text-base',
      badge: 'px-3 py-1.5',
    },
    lg: {
      container: 'text-base',
      emoji: 'text-xl',
      badge: 'px-4 py-2',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={classes.container}>
      {/* Level Badge */}
      <div className={`inline-flex items-center gap-2 ${levelInfo.bgColor} ${levelInfo.color} ${classes.badge} rounded-full font-semibold`}>
        <span className={classes.emoji}>{levelInfo.emoji}</span>
        <span>Level {levelInfo.level}</span>
        {showPoints && (
          <span className="opacity-75">• {formatPoints(points)}</span>
        )}
      </div>

      {/* Level Name */}
      <div className={`mt-1 ${levelInfo.color} font-medium`}>
        {levelInfo.name}
      </div>

      {/* Progress Bar */}
      {showProgress && levelInfo.level < 5 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Fortschritt</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {levelInfo.pointsToNext} bis Level {levelInfo.level + 1}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${levelInfo.bgColor} transition-all duration-500`}
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Max Level erreicht */}
      {showProgress && levelInfo.level === 5 && (
        <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
          <span>✨ Maximales Level erreicht!</span>
        </div>
      )}
    </div>
  );
};

