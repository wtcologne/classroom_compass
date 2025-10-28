/**
 * Question Detail Modal Component
 * Zeigt vollständige Details einer Frage
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Question, Answer } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './AuthProvider';
import { 
  X, 
  ThumbsUp, 
  Calendar, 
  User, 
  MessageCircle,
  Award,
  Eye,
  Edit2,
  Trash2,
  Send,
  Bookmark
} from 'lucide-react';

interface QuestionDetailModalProps {
  question: Question;
  onClose: () => void;
  onUpvoteChange?: () => void;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
  onUpdate?: () => void;
}

export const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({ 
  question, 
  onClose,
  onUpvoteChange,
  isFavorited = false,
  onToggleFavorite,
  onDelete,
  onUpdate
}) => {
  const { user } = useAuth();
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(question.upvotes);
  const [loading, setLoading] = useState(false);
  
  // Answers state
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [showAnswerInput, setShowAnswerInput] = useState(false);
  const [answerContent, setAnswerContent] = useState('');
  
  // Edit/Delete state
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editTitle, setEditTitle] = useState(question.title);
  const [editContent, setEditContent] = useState(question.content);
  
  const isAuthor = user?.id === question.author_id;
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const isAnonymous = question.is_anonymous || !question.author_id;

  // Load answers
  const loadAnswers = async () => {
    setLoadingAnswers(true);
    try {
      const { data, error } = await (supabase
        .from('answers') as any)
        .select(`
          *,
          profiles:profiles!author_id (
            id,
            full_name,
            points
          )
        `)
        .eq('question_id', question.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAnswers(data || []);
    } catch (error) {
      console.error('Error loading answers:', error);
    } finally {
      setLoadingAnswers(false);
    }
  };

  // Check if user has already upvoted
  useEffect(() => {
    const checkUpvote = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await (supabase
          .from('question_upvotes') as any)
          .select('id')
          .eq('question_id', question.id)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!error && data) {
          setHasUpvoted(true);
        }
      } catch (error) {
        console.error('Error checking upvote:', error);
      }
    };
    
    checkUpvote();
    loadAnswers();
  }, [user, question.id]);

  // Handle upvote toggle
  const handleUpvote = async () => {
    if (!user || loading) return;
    
    setLoading(true);
    try {
      if (hasUpvoted) {
        // Remove upvote
        const { error } = await (supabase
          .from('question_upvotes') as any)
          .delete()
          .eq('question_id', question.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        setHasUpvoted(false);
        setUpvoteCount(prev => Math.max(0, prev - 1));
      } else {
        // Add upvote
        const { error } = await (supabase
          .from('question_upvotes') as any)
          .insert([{
            question_id: question.id,
            user_id: user.id,
          }]);
        
        if (error) throw error;
        
        setHasUpvoted(true);
        setUpvoteCount(prev => prev + 1);
      }
      
      if (onUpvoteChange) {
        onUpvoteChange();
      }
    } catch (error) {
      console.error('Error toggling upvote:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle answer submission
  const handleAnswerSubmit = async () => {
    if (!user || loading || !answerContent.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await (supabase
        .from('answers') as any)
        .insert([{
          question_id: question.id,
          author_id: user.id,
          content: answerContent.trim(),
        }]);
      
      if (error) throw error;
      
      setAnswerContent('');
      setShowAnswerInput(false);
      
      // Reload answers
      await loadAnswers();
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle question update
  const handleUpdateQuestion = async () => {
    if (!user || loading || !editTitle.trim() || !editContent.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await (supabase
        .from('questions') as any)
        .update({
          title: editTitle.trim(),
          content: editContent.trim(),
        })
        .eq('id', question.id);
      
      if (error) throw error;
      
      setIsEditing(false);
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating question:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle question delete
  const handleDeleteQuestion = async () => {
    if (!user || loading) return;
    
    setLoading(true);
    try {
      const { error } = await (supabase
        .from('questions') as any)
        .delete()
        .eq('id', question.id);
      
      if (error) throw error;
      
      if (onDelete) onDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting question:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-start justify-between">
          <div className="flex-1 pr-4">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-2xl font-bold px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Fragetitel"
                />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  {isAnonymous && (
                    <span className="badge-secondary text-xs flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Anonym
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-sm">
                    <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'text-primary-600 fill-primary-600' : 'text-primary-600'}`} />
                    <span className="font-medium text-gray-700">
                      {upvoteCount}
                    </span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {question.title}
                </h2>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isAuthor && !isEditing && !showDeleteConfirm && (
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Author Info */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isAnonymous 
                  ? 'Anonymer Benutzer' 
                  : (question.profiles?.full_name || 'Unbekannt')
                }
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {formatDate(question.created_at)}
                {!isAnonymous && question.profiles?.points !== undefined && (
                  <>
                    <span>•</span>
                    <Award className="w-3 h-3" />
                    {question.profiles.points} Punkte
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Frage wirklich löschen?
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Diese Aktion kann nicht rückgängig gemacht werden. Alle Antworten zu dieser Frage werden ebenfalls gelöscht.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleDeleteQuestion}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
                >
                  {loading ? 'Wird gelöscht...' : 'Endgültig löschen'}
                </button>
              </div>
            </div>
          )}

          {/* Question Content */}
          {!showDeleteConfirm && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Frage
              </h3>
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={6}
                  placeholder="Beschreibe deine Frage ausführlich..."
                />
              ) : (
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {question.content}
                </p>
              )}
            </div>
          )}

          {/* Edit Actions */}
          {isEditing && !showDeleteConfirm && (
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={handleUpdateQuestion}
                disabled={loading || !editTitle.trim() || !editContent.trim()}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Wird gespeichert...' : 'Änderungen speichern'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(question.title);
                  setEditContent(question.content);
                }}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Abbrechen
              </button>
            </div>
          )}

          {/* Answers Section */}
          {!showDeleteConfirm && !isEditing && (
          <>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Antworten ({answers.length})
              </h3>
              
              {loadingAnswers && answers.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="spinner w-6 h-6"></div>
                </div>
              ) : answers.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-gray-600 text-sm text-center py-4">
                    Noch keine Antworten vorhanden. Sei der Erste!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {answers.map((answer) => (
                    <AnswerItem
                      key={answer.id}
                      answer={answer}
                      currentUserId={user?.id}
                      onUpdate={loadAnswers}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              )}
            </div>

          {/* Answer Input Section */}
          {showAnswerInput && user && !isEditing && !showDeleteConfirm && (
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Deine Antwort
              </h4>
              <textarea
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Teile deine Erfahrungen und Ratschläge..."
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAnswerSubmit}
                  disabled={loading || !answerContent.trim()}
                  className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Wird gesendet...' : 'Antwort abschicken'}
                </button>
                <button
                  onClick={() => {
                    setShowAnswerInput(false);
                    setAnswerContent('');
                  }}
                  className="btn-secondary"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={handleUpvote}
                disabled={!user || loading}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  hasUpvoted 
                    ? 'bg-primary-600 text-white hover:bg-primary-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-current' : ''}`} />
                {hasUpvoted ? 'Upvoted' : 'Upvote'}
              </button>
              
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
                onClick={() => setShowAnswerInput(!showAnswerInput)}
                disabled={!user}
                className="btn-secondary flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="w-4 h-4" />
                Antworten
              </button>
            </div>
            {!user && (
              <p className="text-sm text-gray-500 text-center">
                Melde dich an, um zu upvoten und zu antworten
              </p>
            )}
          </>
          )}
        </div>
      </div>
    </div>
  );
};

// Answer Item Component
interface AnswerItemProps {
  answer: Answer;
  currentUserId?: string;
  onUpdate: () => void;
  formatDate: (date: string) => string;
}

const AnswerItem: React.FC<AnswerItemProps> = ({ 
  answer, 
  currentUserId, 
  onUpdate,
  formatDate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(answer.content);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAuthor = currentUserId === answer.author_id;

  const handleUpdate = async () => {
    if (!editContent.trim() || loading) return;

    setLoading(true);
    try {
      const { error } = await (supabase
        .from('answers') as any)
        .update({ content: editContent.trim() })
        .eq('id', answer.id);

      if (error) throw error;

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating answer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const { error } = await (supabase
        .from('answers') as any)
        .delete()
        .eq('id', answer.id);

      if (error) throw error;

      onUpdate();
    } catch (error) {
      console.error('Error deleting answer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (showDeleteConfirm) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-gray-900 mb-3">
          Möchtest du diese Antwort wirklich löschen?
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
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900">
                {answer.profiles?.full_name || 'Unbekannt'}
              </p>
              <span className="text-xs text-gray-500">
                {formatDate(answer.created_at)}
              </span>
            </div>
            {isAuthor && !isEditing && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Bearbeiten"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
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
                    setEditContent(answer.content);
                  }}
                  className="text-sm px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 text-sm leading-relaxed">
              {answer.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

