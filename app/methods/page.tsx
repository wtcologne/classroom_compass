/**
 * Methods Page Component
 * Methodenpool-Seite mit CRUD-Funktionalität
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Tag, 
  Star,
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import { MethodCard } from '@/components/MethodCard';
import { MethodDetailModal } from '@/components/MethodDetailModal';
import { Method, MethodFormData, MethodFilters } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';

export default function MethodsPage() {
  const [methods, setMethods] = useState<Method[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<Method | null>(null);
  const [filters, setFilters] = useState<MethodFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showMyMethodsOnly, setShowMyMethodsOnly] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  // Form State
  const [formData, setFormData] = useState<MethodFormData>({
    title: '',
    description: '',
    category: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Kategorien für Dropdown
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

  // Favoriten des Benutzers laden
  const loadUserFavorites = async () => {
    if (!user) {
      setUserFavorites(new Set());
      return;
    }

    try {
      const { data, error } = await (supabase
        .from('method_favorites') as any)
        .select('method_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const favoriteIds = new Set<string>(data?.map((f: any) => f.method_id) || []);
      setUserFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Bei User-Änderung Favoriten laden
  useEffect(() => {
    loadUserFavorites();
  }, [user]);

  // Methoden laden
  const loadMethods = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('methods')
        .select(`
          *,
          profile:profiles!author_id (
            id,
            full_name,
            points
          )
        `)
        .order('created_at', { ascending: false });

      // Filter für "Meine Methoden" anwenden
      if (showMyMethodsOnly && user) {
        query = query.eq('author_id', user.id);
      }

      // Filter anwenden
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      let filteredMethods = data || [];
      
      // Client-seitiger Filter für Favoriten
      if (showFavoritesOnly && user) {
        filteredMethods = filteredMethods.filter((m: any) => userFavorites.has(m.id));
      }
      
      setMethods(filteredMethods);
    } catch (error) {
      console.error('Error loading methods:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, [filters, searchTerm, showMyMethodsOnly, showFavoritesOnly, userFavorites]);

  // Neue Methode hinzufügen
  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setFormLoading(true);

      const { data, error } = await (supabase
        .from('methods') as any)
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          tags: formData.tags,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Form zurücksetzen
      setFormData({
        title: '',
        description: '',
        category: '',
        tags: [],
      });
      setTagInput('');
      setShowAddForm(false);

      // Methoden neu laden
      await loadMethods();
    } catch (error) {
      console.error('Error adding method:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Tag hinzufügen
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  // Tag entfernen
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  // Filter zurücksetzen
  const resetFilters = () => {
    setFilters({});
    setSearchTerm('');
    setShowMyMethodsOnly(false);
    setShowFavoritesOnly(false);
  };

  // Favoriten-Status togglen
  const toggleFavorite = async (methodId: string) => {
    if (!user) return;

    try {
      const isFavorited = userFavorites.has(methodId);

      if (isFavorited) {
        // Favorit entfernen
        const { error } = await (supabase
          .from('method_favorites') as any)
          .delete()
          .eq('user_id', user.id)
          .eq('method_id', methodId);

        if (error) throw error;

        setUserFavorites(prev => {
          const next = new Set(prev);
          next.delete(methodId);
          return next;
        });
      } else {
        // Favorit hinzufügen
        const { error } = await (supabase
          .from('method_favorites') as any)
          .insert([{ user_id: user.id, method_id: methodId }]);

        if (error) throw error;

        setUserFavorites(prev => new Set([...Array.from(prev), methodId]));
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
              Methodenpool
            </h1>
            <p className="text-xl text-gray-600">
              Bewährte Strategien gegen Unterrichtsstörungen
            </p>
          </div>
          
          {user && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary inline-flex items-center mt-4 md:mt-0"
            >
              <Plus className="w-5 h-5 mr-2" />
              Neue Methode
            </button>
          )}
        </div>

        {/* Filter Chips */}
        {user && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setShowMyMethodsOnly(false);
                  setShowFavoritesOnly(false);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  !showMyMethodsOnly && !showFavoritesOnly
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Alle Methoden
              </button>
              <button
                onClick={() => {
                  setShowMyMethodsOnly(true);
                  setShowFavoritesOnly(false);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  showMyMethodsOnly && !showFavoritesOnly
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Meine Methoden
              </button>
              <button
                onClick={() => {
                  setShowMyMethodsOnly(false);
                  setShowFavoritesOnly(true);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 inline-flex items-center gap-2 ${
                  showFavoritesOnly
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
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
                  placeholder="Methoden durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Alle Kategorien</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            {(filters.category || searchTerm || showMyMethodsOnly || showFavoritesOnly) && (
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

        {/* Methods Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner w-8 h-8"></div>
          </div>
        ) : methods.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Keine Methoden gefunden
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filters.category 
                ? 'Versuche andere Suchbegriffe oder Filter.'
                : 'Sei der Erste und teile eine bewährte Methode!'
              }
            </p>
            {user && !searchTerm && !filters.category && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary inline-flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Erste Methode hinzufügen
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {methods.map((method) => (
              <MethodCard
                key={method.id}
                method={method}
                onViewDetails={(method) => {
                  setSelectedMethod(method);
                }}
                isFavorited={userFavorites.has(method.id)}
                onToggleFavorite={() => toggleFavorite(method.id)}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )}

        {/* Method Detail Modal */}
        {selectedMethod && (
          <MethodDetailModal
            method={selectedMethod}
            onClose={() => setSelectedMethod(null)}
            onRatingChange={loadMethods}
            onDelete={() => {
              setSelectedMethod(null);
              loadMethods();
            }}
            onUpdate={() => {
              loadMethods();
            }}
            isFavorited={userFavorites.has(selectedMethod.id)}
            onToggleFavorite={() => toggleFavorite(selectedMethod.id)}
          />
        )}

        {/* Add Method Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">
                  Neue Methode hinzufügen
                </h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddMethod} className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Titel der Methode *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="input"
                    placeholder="z.B. Die 3-2-1 Regel"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Kategorie *
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="">Kategorie wählen</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Beschreibung *
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input"
                    rows={4}
                    placeholder="Beschreibe die Methode detailliert..."
                    required
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="badge-primary inline-flex items-center"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-primary-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 input"
                      placeholder="Tag hinzufügen..."
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="btn-secondary"
                    >
                      <Tag className="w-4 h-4" />
                    </button>
                  </div>
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
                        Methode speichern
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
