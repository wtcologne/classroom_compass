/**
 * MethodCard Component
 * Karte zur Darstellung einer Unterrichtsmethode mit Apple-like Design
 */

'use client';

import React from 'react';
import { Star, User, Calendar, Tag, MessageCircle } from 'lucide-react';
import { Method } from '@/types';

interface MethodCardProps {
  method: Method;
  onViewDetails?: (method: Method) => void;
  showAuthor?: boolean;
}

export const MethodCard: React.FC<MethodCardProps> = ({
  method,
  onViewDetails,
  showAuthor = true,
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="card-hover group cursor-pointer" onClick={() => onViewDetails?.(method)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            {method.title}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Tag className="w-4 h-4" />
              <span className="badge-primary">{method.category}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(method.created_at)}</span>
            </div>
          </div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center space-x-1">
          <div className="flex">
            {renderStars(method.rating)}
          </div>
          <span className="text-sm text-gray-600 ml-1">
            ({method.rating_count})
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4 line-clamp-3">
        {method.description}
      </p>

      {/* Tags */}
      {method.tags && method.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {method.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="badge-gray text-xs">
              {tag}
            </span>
          ))}
          {method.tags.length > 3 && (
            <span className="badge-gray text-xs">
              +{method.tags.length - 3} weitere
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {showAuthor && method.profiles && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {method.profiles.full_name || 'Anonym'}
              </p>
              <p className="text-xs text-gray-500">
                {method.profiles.points} Punkte
              </p>
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-4 h-4" />
            <span>Kommentare</span>
          </div>
          <div className="text-primary-600 font-medium group-hover:text-primary-700">
            Details ansehen →
          </div>
        </div>
      </div>
    </div>
  );
};
