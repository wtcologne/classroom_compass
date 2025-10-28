/**
 * OpenAI Chat API Route
 * Server-seitige Route für ChatGPT-Integration
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// OpenAI Client initialisieren
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Supabase Client für Auth-Check
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Auth-Check: Prüfe ob User eingeloggt ist
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentifizierung erforderlich. Bitte melde dich an.' },
        { status: 401 }
      );
    }

    // Verifiziere den Token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Ungültige Authentifizierung. Bitte melde dich erneut an.' },
        { status: 401 }
      );
    }

    // Request Body parsen
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Nachricht ist erforderlich' },
        { status: 400 }
      );
    }

    // System Prompt für Unterrichtsstörungen
    const systemPrompt = `Du bist ein erfahrener Pädagoge und Experte für Unterrichtsstörungen. 
Du hilfst Lehrer:innen und Lehramtsstudierenden dabei, mit verschiedenen Arten von Unterrichtsstörungen umzugehen.

Deine Antworten sollten:
- Praktisch und umsetzbar sein
- Verschiedene Ansätze berücksichtigen
- Empathisch und verständnisvoll sein
- Konkrete Beispiele enthalten
- Auf die Bedürfnisse der Schüler:innen eingehen
- Rechtliche und ethische Aspekte berücksichtigen

Antworte auf Deutsch und sei präzise, aber ausführlich genug, um wirklich zu helfen.`;

    // OpenAI API aufrufen
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('Keine Antwort von OpenAI erhalten');
    }

    // Erfolgreiche Antwort zurückgeben
    return NextResponse.json({
      message: response,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('OpenAI API Error:', error);

    // Spezifische Fehlerbehandlung
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'API-Limit erreicht. Bitte versuchen Sie es später erneut.' },
        { status: 429 }
      );
    }

    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'OpenAI API-Schlüssel ist ungültig.' },
        { status: 500 }
      );
    }

    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Zu viele Anfragen. Bitte warten Sie einen Moment.' },
        { status: 429 }
      );
    }

    // Allgemeiner Fehler
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' },
      { status: 500 }
    );
  }
}

// GET-Methode für Health Check
export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'OpenAI Chat API ist verfügbar',
    timestamp: new Date().toISOString(),
  });
}
