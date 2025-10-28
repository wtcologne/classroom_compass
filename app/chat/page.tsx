/**
 * Chat Page Component
 * KI-Assistent-Seite mit OpenAI-Integration
 */

'use client';

import React, { useState } from 'react';
import { Bot, Lightbulb, BookOpen, MessageCircle, Sparkles } from 'lucide-react';
import { ChatBox } from '@/components/ChatBox';
import { ChatMessage } from '@/types';

export default function ChatPage() {
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
      // API-Aufruf an OpenAI
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Senden der Nachricht');
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
