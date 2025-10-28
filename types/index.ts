/**
 * TypeScript-Typen für Classroom Compass
 * Definiert alle Datenstrukturen für die Anwendung
 */

// User Profile Types
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  points: number;
  created_at: string;
  updated_at: string;
}

// Method Types
export interface Method {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  author_id: string;
  rating: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile; // Joined profile data
}

// Question Types
export interface Question {
  id: string;
  title: string;
  content: string;
  author_id?: string; // Optional für anonyme Fragen
  is_anonymous: boolean;
  upvotes: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile; // Joined profile data (nur wenn nicht anonym)
}

// Answer Types
export interface Answer {
  id: string;
  question_id: string;
  content: string;
  author_id: string;
  upvotes: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile; // Joined profile data
}

// Comment Types
export interface Comment {
  id: string;
  method_id: string;
  content: string;
  author_id: string;
  rating?: number; // 1-5 Sterne
  created_at: string;
  updated_at: string;
  profiles?: Profile; // Joined profile data
}

// Form Types
export interface MethodFormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
}

export interface QuestionFormData {
  title: string;
  content: string;
  is_anonymous: boolean;
}

export interface CommentFormData {
  content: string;
  rating?: number;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Chat Types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Filter Types
export interface MethodFilters {
  category?: string;
  tags?: string[];
  search?: string;
}

export interface QuestionFilters {
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'upvotes';
}
