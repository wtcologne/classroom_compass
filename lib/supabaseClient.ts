/**
 * Supabase Client Konfiguration
 * Zentrale Konfiguration für die Verbindung zur Supabase-Datenbank
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Supabase URL und Anon Key aus Umgebungsvariablen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabase Client erstellen
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Automatische Token-Erneuerung aktivieren
    autoRefreshToken: true,
    // Session persistieren
    persistSession: true,
    // Session-Detection aktivieren
    detectSessionInUrl: true
  }
});

// Hilfsfunktionen für häufige Operationen
export const auth = supabase.auth;
export const db = supabase.from;

/**
 * Hilfsfunktion zum Abrufen des aktuellen Benutzers
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

/**
 * Hilfsfunktion zum Abrufen des Benutzerprofils
 */
export const getCurrentProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (error) throw error;
  return profile;
};
