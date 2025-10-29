/**
 * CategoryBadge Component
 * Badge mit kategorie-spezifischer Farbkodierung
 * Diese Komponente stellt sicher, dass Tailwind alle Farbklassen erkennt
 */

'use client';

import React from 'react';
import { Tag } from 'lucide-react';
import { getCategoryColor } from '@/lib/categoryColors';

interface CategoryBadgeProps {
  category: string;
  showIcon?: boolean;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ 
  category, 
  showIcon = true,
  className = ''
}) => {
  const colors = getCategoryColor(category);
  
  // Alle möglichen Klassen hier explizit auflisten, damit Tailwind sie erkennt
  const allPossibleClasses = `
    bg-emerald-50 text-emerald-700 border-emerald-200
    bg-orange-50 text-orange-700 border-orange-200
    bg-blue-50 text-blue-700 border-blue-200
    bg-purple-50 text-purple-700 border-purple-200
    bg-indigo-50 text-indigo-700 border-indigo-200
    bg-amber-50 text-amber-700 border-amber-200
    bg-pink-50 text-pink-700 border-pink-200
    bg-teal-50 text-teal-700 border-teal-200
    bg-gray-50 text-gray-700 border-gray-200
  `;

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-3 py-1 ${colors.bg} ${colors.text} rounded-full text-xs font-medium ${className}`}
    >
      {showIcon && <Tag className="w-3.5 h-3.5" />}
      {category}
    </span>
  );
};

