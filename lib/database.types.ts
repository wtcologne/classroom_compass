/**
 * Supabase Database Types
 * Automatisch generierte Typen für die Datenbankstruktur
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'user' | 'admin';
          points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin';
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin';
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      methods: {
        Row: {
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
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: string;
          tags: string[];
          author_id: string;
          rating?: number;
          rating_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          tags?: string[];
          author_id?: string;
          rating?: number;
          rating_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          title: string;
          content: string;
          author_id: string | null;
          is_anonymous: boolean;
          upvotes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          author_id?: string | null;
          is_anonymous?: boolean;
          upvotes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          author_id?: string | null;
          is_anonymous?: boolean;
          upvotes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      answers: {
        Row: {
          id: string;
          question_id: string;
          content: string;
          author_id: string;
          upvotes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          content: string;
          author_id: string;
          upvotes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          content?: string;
          author_id?: string;
          upvotes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          method_id: string;
          content: string;
          author_id: string;
          rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          method_id: string;
          content: string;
          author_id: string;
          rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          method_id?: string;
          content?: string;
          author_id?: string;
          rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
