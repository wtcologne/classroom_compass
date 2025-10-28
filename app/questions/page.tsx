/**
 * Questions Page Component
 * "Frag die Crowd"-Seite mit Fragen-System
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Filter, 
  ThumbsUp,
  X,
  Save,
  Eye,
  EyeOff,
  SortAsc,
  SortDesc,
  Bookmark
} from 'lucide-react';
import { QuestionCard } from '@/components/QuestionCard';
import { QuestionDetailModal } from '@/components/QuestionDetailModal';
import { Question, QuestionFormData, QuestionFilters } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [filters, setFilters] = useState<QuestionFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showMyQuestionsOnly, setShowMyQuestionsOnly] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  // Form State
  const [formData, setFormData] = useState<QuestionFormData>({
    title: '',
    content: '',
    is_anonymous: false,
  });
  const [formLoading, setFormLoading] = useState(false);

  // Sort Options
  const sortOptions = [
    { value: 'newest', label: 'Neueste zuerst', icon: SortDesc },
    { value: 'oldest', label: 'Älteste zuerst', icon: SortAsc },
    { value: 'upvotes', label: 'Meist bewertet', icon: ThumbsUp },
  ];

  // Favoriten des Benutzers laden
  const loadUserFavorites = async () => {
    if (!user) {
      setUserFavorites(new Set());
      return;
    }

    try {
      const { data, error } = await (supabase
        .from('question_favorites') as any)
        .select('question_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const favoriteIds = new Set<string>(data?.map((f: any) => f.question_id) || []);
      setUserFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Bei User-Änderung Favoriten laden
  useEffect(() => {
    loadUserFavorites();
  }, [user]);

  // Fragen laden
  const loadQuestions = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('questions')
        .select(`
          *,
          profile:profiles!author_id (
            id,
            full_name,
            points
          )
        `);

      // Filter für "Meine Fragen" anwenden
      if (showMyQuestionsOnly && user) {
        query = query.eq('author_id', user.id);
      }

      // Sortierung anwenden
      const sortBy = filters.sortBy || 'newest';
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'upvotes':
          query = query.order('upvotes', { ascending: false });
          break;
      }

      // Suchfilter anwenden
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      let filteredQuestions = data || [];
      
      // Client-seitiger Filter für Favoriten
      if (showFavoritesOnly && user) {
        filteredQuestions = filteredQuestions.filter((q: any) => userFavorites.has(q.id));
      }
      
      setQuestions(filteredQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [filters, searchTerm, showMyQuestionsOnly, showFavoritesOnly, userFavorites]);

  // Neue Frage hinzufügen
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setFormLoading(true);

      const { data, error } = await supabase
        .from('questions')
        .insert([{
          title: formData.title,
          content: formData.content,
          author_id: user.id, // Immer speichern, auch bei anonymen Fragen
          is_anonymous: formData.is_anonymous,
        }] as any)
        .select()
        .single();

      if (error) throw error;

      // Form zurücksetzen
      setFormData({
        title: '',
        content: '',
        is_anonymous: false,
      });
      setShowAddForm(false);

      // Fragen neu laden
      await loadQuestions();
    } catch (error) {
      console.error('Error adding question:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Upvote-Funktion
  const handleUpvote = async (questionId: string) => {
    if (!user) return;

    try {
      // TODO: Implement upvote functionality
      // This would require a separate upvotes table or updating the upvotes count
      console.log('Upvote question:', questionId);
    } catch (error) {
      console.error('Error upvoting question:', error);
    }
  };

  // Filter zurücksetzen
  const resetFilters = () => {
    setFilters({});
    setSearchTerm('');
    setShowMyQuestionsOnly(false);
    setShowFavoritesOnly(false);
  };

  // Favoriten-Status togglen
  const toggleFavorite = async (questionId: string) => {
    if (!user) return;

    try {
      const isFavorited = userFavorites.has(questionId);

      if (isFavorited) {
        // Favorit entfernen
        const { error } = await (supabase
          .from('question_favorites') as any)
          .delete()
          .eq('user_id', user.id)
          .eq('question_id', questionId);

        if (error) throw error;

        setUserFavorites(prev => {
          const next = new Set(prev);
          next.delete(questionId);
          return next;
        });
      } else {
        // Favorit hinzufügen
        const { error } = await (supabase
          .from('question_favorites') as any)
          .insert([{ user_id: user.id, question_id: questionId }]);

        if (error) throw error;

        setUserFavorites(prev => new Set([...Array.from(prev), questionId]));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Frag die Crowd
            </h1>
            <p className="text-xl text-gray-600">
              Stelle Fragen an die Community und erhalte Antworten von erfahrenen Kolleg:innen
            </p>
          </div>
          
          {user && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary inline-flex items-center mt-4 md:mt-0"
            >
              <Plus className="w-5 h-5 mr-2" />
              Frage stellen
            </button>
          )}
        </div>

        {/* Filter Chips */}
        {user && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setShowMyQuestionsOnly(false);
                  setShowFavoritesOnly(false);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  !showMyQuestionsOnly && !showFavoritesOnly
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Alle Fragen
              </button>
              <button
                onClick={() => {
                  setShowMyQuestionsOnly(true);
                  setShowFavoritesOnly(false);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  showMyQuestionsOnly && !showFavoritesOnly
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Meine Fragen
              </button>
              <button
                onClick={() => {
                  setShowMyQuestionsOnly(false);
                  setShowFavoritesOnly(true);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 inline-flex items-center gap-2 ${
                  showFavoritesOnly
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                Favoriten
              </button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Fragen durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort Filter */}
            <div className="lg:w-64">
              <select
                value={filters.sortBy || 'newest'}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            {(filters.sortBy !== 'newest' || searchTerm || showMyQuestionsOnly || showFavoritesOnly) && (
              <button
                onClick={resetFilters}
                className="btn-secondary inline-flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Zurücksetzen
              </button>
            )}
          </div>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner w-8 h-8"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Keine Fragen gefunden
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Versuche andere Suchbegriffe.'
                : 'Sei der Erste und stelle eine Frage!'
              }
            </p>
            {user && !searchTerm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary inline-flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Erste Frage stellen
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onViewDetails={(question) => {
                  setSelectedQuestion(question);
                }}
                isFavorited={userFavorites.has(question.id)}
                onToggleFavorite={() => toggleFavorite(question.id)}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )}

        {/* Question Detail Modal */}
        {selectedQuestion && (
          <QuestionDetailModal
            question={selectedQuestion}
            onClose={() => setSelectedQuestion(null)}
            onUpvoteChange={loadQuestions}
            isFavorited={userFavorites.has(selectedQuestion.id)}
            onToggleFavorite={() => toggleFavorite(selectedQuestion.id)}
            onDelete={loadQuestions}
            onUpdate={loadQuestions}
          />
        )}

        {/* Add Question Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">
                  Neue Frage stellen
                </h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddQuestion} className="p-6 space-y-6">
                {/* Anonymous Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Anonyme Frage
                    </h3>
                    <p className="text-xs text-gray-600">
                      Deine Identität wird nicht angezeigt
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, is_anonymous: !prev.is_anonymous }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.is_anonymous ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.is_anonymous ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Titel der Frage *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="input"
                    placeholder="z.B. Wie gehe ich mit respektlosen Schüler:innen um?"
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Detaillierte Beschreibung *
                  </label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="input"
                    rows={6}
                    placeholder="Beschreibe deine Situation möglichst detailliert. Je mehr Kontext du gibst, desto besser können dir andere helfen..."
                    required
                  />
                </div>

                {/* Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Tipps für eine gute Frage:
                  </h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Beschreibe die Situation konkret</li>
                    <li>• Erwähne das Alter der Schüler:innen</li>
                    <li>• Gib den Kontext an (Fach, Klassenstufe, etc.)</li>
                    <li>• Erkläre, was du bereits versucht hast</li>
                  </ul>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="btn-secondary"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="btn-primary inline-flex items-center"
                  >
                    {formLoading ? (
                      <>
                        <div className="spinner w-4 h-4 mr-2"></div>
                        Speichern...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Frage stellen
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
