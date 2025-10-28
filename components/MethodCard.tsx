/**
 * MethodCard Component
 * Karte zur Darstellung einer Unterrichtsmethode mit Apple-like Design
 */

'use client';

import React from 'react';
import { Star, User, Tag, Bookmark } from 'lucide-react';
import { Method } from '@/types';

interface MethodCardProps {
  method: Method;
  onViewDetails?: (method: Method) => void;
  showAuthor?: boolean;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
  currentUserId?: string;
}

export const MethodCard: React.FC<MethodCardProps> = ({
  method,
  onViewDetails,
  showAuthor = true,
  isFavorited = false,
  onToggleFavorite,
  currentUserId,
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-3.5 h-3.5 fill-yellow-400/50 text-yellow-400" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-3.5 h-3.5 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div className="card-hover group cursor-pointer relative" onClick={() => onViewDetails?.(method)}>
      {/* Favorite Button - Top Right */}
      {currentUserId && onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 ${
            isFavorited
              ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
              : 'text-gray-400 bg-white hover:bg-gray-100 hover:text-yellow-500 shadow-sm'
          }`}
          title={isFavorited ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
        >
          <Bookmark className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
        </button>
      )}

      {/* Category Badge */}
      <div className="mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
          <Tag className="w-3.5 h-3.5" />
          {method.category}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2 pr-12">
        {method.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
        {method.description}
      </p>

      {/* Tags */}
      {method.tags && method.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {method.tags.slice(0, 4).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              {tag}
            </span>
          ))}
          {method.tags.length > 4 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
              +{method.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {renderStars(method.rating)}
          </div>
          <span className="text-xs text-gray-500 font-medium">
            {method.rating > 0 ? method.rating.toFixed(1) : '0.0'} ({method.rating_count})
          </span>
        </div>

        {/* Author */}
        {showAuthor && method.profile && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <User className="w-3.5 h-3.5" />
            <span className="truncate max-w-[100px]">{method.profile.full_name || 'Anonym'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
