/**
 * QuestionCard Component
 * Karte zur Darstellung einer Community-Frage mit Apple-like Design
 */

'use client';

import React from 'react';
import { MessageCircle, User, Calendar, ThumbsUp, Eye, Bookmark } from 'lucide-react';
import { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
  onViewDetails?: (question: Question) => void;
  showAuthor?: boolean;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
  currentUserId?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onViewDetails,
  showAuthor = true,
  isFavorited = false,
  onToggleFavorite,
  currentUserId,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Gerade eben';
    if (diffInHours < 24) return `vor ${diffInHours}h`;
    if (diffInHours < 48) return 'Gestern';
    return formatDate(dateString);
  };

  return (
    <div className="card-hover group cursor-pointer" onClick={() => onViewDetails?.(question)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            {question.title}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatRelativeTime(question.created_at)}</span>
            </div>
            {question.is_anonymous && (
              <span className="badge-gray text-xs">Anonym</span>
            )}
          </div>
        </div>
        
        {/* Upvotes & Favorite */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-primary-600">
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm font-medium">{question.upvotes}</span>
          </div>
          
          {currentUserId && onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={`p-2 rounded-full transition-all duration-200 ${
                isFavorited
                  ? 'text-yellow-500 hover:bg-yellow-50'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-yellow-500'
              }`}
              title={isFavorited ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
            >
              <Bookmark className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Content Preview */}
      <p className="text-gray-600 mb-4 line-clamp-3">
        {question.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {showAuthor && !question.is_anonymous && question.profile && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {question.profile.full_name || 'Benutzer'}
              </p>
              <p className="text-xs text-gray-500">
                {question.profile.points} Punkte
              </p>
            </div>
          </div>
        )}
        
        {question.is_anonymous && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Anonymer Nutzer
              </p>
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-4 h-4" />
            <span>Antworten</span>
          </div>
          <div className="text-primary-600 font-medium group-hover:text-primary-700">
            Diskussion beitreten →
          </div>
        </div>
      </div>
    </div>
  );
};
