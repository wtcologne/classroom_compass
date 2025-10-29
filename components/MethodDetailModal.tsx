/**
 * Method Detail Modal Component
 * Zeigt vollständige Details einer Methode
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Method, Comment } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './AuthProvider';
import { CategoryBadge } from './CategoryBadge';
import { 
  X, 
  Star, 
  Calendar, 
  User, 
  Award,
  MessageSquare,
  Edit2,
  Trash2,
  Bookmark
} from 'lucide-react';

interface MethodDetailModalProps {
  method: Method;
  onClose: () => void;
  onRatingChange?: () => void;
  onDelete?: () => void;
  onUpdate?: () => void;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
}

export const MethodDetailModal: React.FC<MethodDetailModalProps> = ({ 
  method, 
  onClose,
  onRatingChange,
  onDelete,
  onUpdate,
  isFavorited = false,
  onToggleFavorite
}) => {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [showRatingInput, setShowRatingInput] = useState(false);
  const [comment, setComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: method.title,
    description: method.description,
    category: method.category,
    tags: method.tags || [],
  });
  
  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const isAuthor = user?.id === method.author_id;
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Load comments
  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await (supabase
        .from('comments') as any)
        .select(`
          *,
          profiles:profiles!author_id (
            id,
            full_name,
            points
          )
        `)
        .eq('method_id', method.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  // Check if user has already rated
  useEffect(() => {
    const checkRating = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await (supabase
          .from('method_ratings') as any)
          .select('rating')
          .eq('method_id', method.id)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!error && data) {
          setUserRating(data.rating);
        }
      } catch (error) {
        console.error('Error checking rating:', error);
      }
    };
    
    checkRating();
    loadComments();
  }, [user, method.id]);

  // Handle rating submission
  const handleRating = async (rating: number) => {
    if (!user || loading) return;
    
    setLoading(true);
    try {
      if (userRating > 0) {
        // Update existing rating
        const { error } = await (supabase
          .from('method_ratings') as any)
          .update({ rating })
          .eq('method_id', method.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Insert new rating
        const { error } = await (supabase
          .from('method_ratings') as any)
          .insert([{
            method_id: method.id,
            user_id: user.id,
            rating,
          }]);
        
        if (error) throw error;
      }
      
      setUserRating(rating);
      setShowRatingInput(false);
      
      if (onRatingChange) {
        onRatingChange();
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!user || loading || !comment.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await (supabase
        .from('comments') as any)
        .insert([{
          method_id: method.id,
          author_id: user.id,
          content: comment.trim(),
        }]);
      
      if (error) throw error;
      
      setComment('');
      setShowCommentInput(false);
      
      // Reload comments
      await loadComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle method update
  const handleUpdate = async () => {
    if (!user || loading || !isAuthor) return;
    
    setLoading(true);
    try {
      const { error } = await (supabase
        .from('methods') as any)
        .update({
          title: editData.title,
          description: editData.description,
          category: editData.category,
          tags: editData.tags,
        })
        .eq('id', method.id);
      
      if (error) throw error;
      
      setIsEditing(false);
      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (error) {
      console.error('Error updating method:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle method delete
  const handleDelete = async () => {
    if (!user || loading || !isAuthor) return;
    
    setLoading(true);
    try {
      const { error } = await (supabase
        .from('methods') as any)
        .delete()
        .eq('id', method.id);
      
      if (error) throw error;
      
      if (onDelete) {
        onDelete();
      }
      onClose();
    } catch (error) {
      console.error('Error deleting method:', error);
    } finally {
      setLoading(false);
    }
  };

  // Categories for dropdown
  const categories = [
    'Prävention',
    'Sofortmaßnahmen',
    'Langfristige Strategien',
    'Kommunikation',
    'Klassenmanagement',
    'Verhaltensmodifikation',
    'Motivation',
    'Gruppenarbeit',
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <CategoryBadge category={method.category} showIcon={false} />
                {method.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {method.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({method.rating_count})
                    </span>
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {method.title}
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isAuthor && !isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                    title="Bearbeiten"
                  >
                    <Edit2 className="w-5 h-5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors"
                    title="Löschen"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Methode löschen?
              </h3>
              <p className="text-gray-600 mb-6">
                Bist du sicher, dass du diese Methode löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Wird gelöscht...' : 'Löschen'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Edit Form */}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titel *
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategorie *
                </label>
                <select
                  value={editData.category}
                  onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                  className="input"
                  required
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibung *
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  className="input"
                  rows={6}
                  required
                />
              </div>


              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({
                      title: method.title,
                      description: method.description,
                      category: method.category,
                      tags: method.tags || [],
                    });
                  }}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={loading || !editData.title || !editData.description || !editData.category}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {loading ? 'Wird gespeichert...' : 'Speichern'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Author Info */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {method.profile?.full_name || 'Unbekannt'}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {formatDate(method.created_at)}
                {method.profile?.points !== undefined && (
                  <>
                    <span>•</span>
                    <Award className="w-3 h-3" />
                    {method.profile.points} Punkte
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Beschreibung
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {method.description}
            </p>
          </div>


          {/* Rating Section */}
          {showRatingInput && user && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                {userRating > 0 ? 'Deine Bewertung ändern' : 'Methode bewerten'}
              </h4>
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    disabled={loading}
                    className="transition-transform hover:scale-110 disabled:opacity-50"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverRating || userRating)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowRatingInput(false)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Abbrechen
              </button>
            </div>
          )}

          {/* Existing Comments */}
          {comments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Kommentare ({comments.length})
              </h3>
              <div className="space-y-4">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUserId={user?.id}
                    onUpdate={loadComments}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Comment Input Section */}
          {showCommentInput && user && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Kommentar hinzufügen
              </h4>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Teile deine Erfahrungen mit dieser Methode..."
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleCommentSubmit}
                  disabled={loading || !comment.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Wird gesendet...' : 'Kommentar abschicken'}
                </button>
                <button
                  onClick={() => {
                    setShowCommentInput(false);
                    setComment('');
                  }}
                  className="btn-secondary"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}

          {/* Loading state for comments */}
          {loadingComments && comments.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="spinner w-6 h-6"></div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            {onToggleFavorite && (
              <button 
                onClick={onToggleFavorite}
                disabled={!user}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isFavorited 
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                {isFavorited ? 'Favorit' : 'Favorisieren'}
              </button>
            )}
            
            <button 
              onClick={() => setShowCommentInput(!showCommentInput)}
              disabled={!user}
              className="btn-secondary flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageSquare className="w-4 h-4" />
              Kommentieren
            </button>
            
            <button 
              onClick={() => setShowRatingInput(!showRatingInput)}
              disabled={!user}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                userRating > 0
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
              }`}
            >
              <Star className={`w-4 h-4 ${userRating > 0 ? 'fill-current' : ''}`} />
              {userRating > 0 ? `Bewertet (${userRating})` : 'Bewerten'}
            </button>
          </div>
          {!user && (
            <p className="text-sm text-gray-500 text-center">
              Melde dich an, um zu bewerten und zu kommentieren
            </p>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Comment Item Component
interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onUpdate: () => void;
  formatDate: (date: string) => string;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  currentUserId, 
  onUpdate,
  formatDate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAuthor = currentUserId === comment.author_id;

  const handleUpdate = async () => {
    if (!editContent.trim() || loading) return;

    setLoading(true);
    try {
      const { error } = await (supabase
        .from('comments') as any)
        .update({ content: editContent.trim() })
        .eq('id', comment.id);

      if (error) throw error;

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const { error } = await (supabase
        .from('comments') as any)
        .delete()
        .eq('id', comment.id);

      if (error) throw error;

      onUpdate();
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (showDeleteConfirm) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-gray-900 mb-3">
          Möchtest du diesen Kommentar wirklich löschen?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="text-sm px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Abbrechen
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-sm px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Wird gelöscht...' : 'Löschen'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900">
                {comment.profiles?.full_name || 'Unbekannt'}
              </p>
              <span className="text-xs text-gray-500">
                {formatDate(comment.created_at)}
              </span>
            </div>
            {isAuthor && !isEditing && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Bearbeiten"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Löschen"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                </button>
              </div>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  disabled={loading || !editContent.trim()}
                  className="text-sm px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Wird gespeichert...' : 'Speichern'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="text-sm px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 text-sm leading-relaxed">
              {comment.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

