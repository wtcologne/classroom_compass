/**
 * Chat Page Component
 * KI-Assistent-Seite mit OpenAI-Integration
 */

'use client';

import React, { useState } from 'react';
import { Bot, Lightbulb, BookOpen, MessageCircle, Sparkles, Lock } from 'lucide-react';
import { ChatBox } from '@/components/ChatBox';
import { ChatMessage } from '@/types';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string) => {
    // User message hinzufügen
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Session-Token holen
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Nicht authentifiziert');
      }

      // API-Aufruf an OpenAI mit Auth-Token
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Senden der Nachricht');
      }

      const data = await response.json();

      // AI response hinzufügen
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      
      // Error message hinzufügen
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    {
      icon: Lightbulb,
      question: 'Was tun bei Unruhe in Gruppenarbeiten?',
      color: 'bg-yellow-500',
    },
    {
      icon: BookOpen,
      question: 'Wie reagiere ich auf respektloses Verhalten?',
      color: 'bg-blue-500',
    },
    {
      icon: MessageCircle,
      question: 'Strategien für störende Schüler:innen',
      color: 'bg-green-500',
    },
    {
      icon: Sparkles,
      question: 'Präventive Maßnahmen gegen Störungen',
      color: 'bg-purple-500',
    },
  ];

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  // Wenn nicht eingeloggt, Login-Hinweis anzeigen
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/30 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl mb-6 shadow-lg">
              <Lock className="w-10 h-10 text-primary-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Login erforderlich
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Der KI-Assistent ist nur für registrierte Benutzer verfügbar. 
              Melde dich an, um professionelle Beratung zu Unterrichtsstörungen zu erhalten.
            </p>
            
            <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl mb-8">
              <div className="flex items-start gap-3 text-left">
                <Bot className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Was dich erwartet:</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>✓ ChatGPT-basierte Beratung</li>
                    <li>✓ Spezialisiert auf Unterrichtsstörungen</li>
                    <li>✓ Praktische Tipps und Methoden</li>
                    <li>✓ Rund um die Uhr verfügbar</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/methods"
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Zur Anmeldung
              </Link>
              <Link
                href="/"
                className="px-6 py-3 bg-white/80 backdrop-blur-xl border-2 border-gray-200 text-gray-900 rounded-xl font-semibold hover:bg-white hover:border-primary-300 transition-all duration-300"
              >
                Zurück zur Startseite
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
            <Bot className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            KI-Assistent für Unterrichtsstörungen
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stelle mir Fragen zu Unterrichtsstörungen und erhalte professionelle 
            Beratung mit bewährten Methoden und innovativen Lösungsansätzen.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="h-[600px]">
              <ChatBox
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                placeholder="Beschreibe deine Situation oder stelle eine Frage zu Unterrichtsstörungen..."
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Suggested Questions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Häufige Fragen
              </h3>
              <div className="space-y-3">
                {suggestedQuestions.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(item.question)}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-sm text-gray-700 group-hover:text-gray-900">
                          {item.question}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tips */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tipps für bessere Antworten
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Beschreibe die Situation möglichst detailliert</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Erwähne das Alter der Schüler:innen</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Gib den Kontext der Störung an</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Frage nach spezifischen Strategien</p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="card bg-blue-50 border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Hinweis
              </h3>
              <p className="text-xs text-blue-800">
                Die KI-Antworten dienen als Anregung und sollten immer mit 
                pädagogischem Fachwissen und der jeweiligen Situation abgewogen werden.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
