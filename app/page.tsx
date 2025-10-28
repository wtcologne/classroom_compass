/**
 * Homepage Component
 * Startseite mit Einführung und Navigation zu den Hauptbereichen
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  MessageCircle, 
  Bot, 
  ArrowRight, 
  Users, 
  Lightbulb,
  Shield,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useModal } from '@/components/ModalContext';

export default function HomePage() {
  const { user } = useAuth();
  const { openRegisterModal } = useModal();

  const features = [
    {
      icon: BookOpen,
      title: 'Methodenpool',
      description: 'Sammlung bewährter Strategien gegen Unterrichtsstörungen mit Such- und Filterfunktion',
      href: '/methods',
      color: 'bg-blue-500',
    },
    {
      icon: MessageCircle,
      title: 'Frag die Crowd',
      description: 'Stelle anonym Fragen und erhalte Antworten von erfahrenen Kolleg:innen',
      href: '/questions',
      color: 'bg-green-500',
    },
    {
      icon: Bot,
      title: 'KI-Assistent',
      description: 'Nutze ChatGPT für innovative Ideen und Lösungsansätze bei Unterrichtsproblemen',
      href: '/chat',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/30 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32">
        {/* Glassmorphism Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg shadow-primary-500/10 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                Für Lehrer:innen und Lehramtsstudierende
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Unterrichtsstörungen
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                meistern
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Bewährte Methoden entdecken. Community fragen. KI-Support nutzen.
            </p>

            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/methods"
                  className="group relative px-8 py-4 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-2xl font-semibold shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-500/40 transition-all duration-300 inline-flex items-center justify-center overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Methoden entdecken
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <button
                  onClick={openRegisterModal}
                  className="px-8 py-4 bg-white/80 backdrop-blur-xl border-2 border-gray-200 text-gray-900 rounded-2xl font-semibold hover:bg-white hover:border-primary-300 hover:shadow-lg transition-all duration-300 inline-flex items-center justify-center"
                >
                  Community beitreten
                </button>
              </div>
            )}

            {user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/methods"
                  className="group relative px-8 py-4 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-2xl font-semibold shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-500/40 transition-all duration-300 inline-flex items-center justify-center overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Methodenpool erkunden
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  href="/chat"
                  className="px-8 py-4 bg-white/80 backdrop-blur-xl border-2 border-gray-200 text-gray-900 rounded-2xl font-semibold hover:bg-white hover:border-primary-300 hover:shadow-lg transition-all duration-300 inline-flex items-center justify-center"
                >
                  KI-Assistent starten
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Alles was du brauchst
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Drei Bereiche, die perfekt zusammenarbeiten
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group relative"
                >
                  <div className="relative bg-white/60 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl shadow-gray-900/5 hover:shadow-2xl hover:shadow-gray-900/10 transition-all duration-500 hover:-translate-y-2">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative">
                      <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {feature.description}
                      </p>
                      
                      <div className="flex items-center text-primary-600 font-semibold group-hover:text-primary-700">
                        <span>Mehr erfahren</span>
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-blue-600 to-purple-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2em0wIDJjLTMuMzE0IDAtNi0yLjY4Ni02LTZzMi42ODYtNiA2LTYgNiAyLjY4NiA2IDYtMi42ODYgNi02IDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Bereit für besseren Unterricht?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed">
              Schließe dich der Community an. Entdecke bewährte Methoden. 
              Nutze modernste KI-Unterstützung.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/methods"
                className="group px-8 py-4 bg-white text-primary-600 rounded-2xl font-semibold shadow-2xl hover:shadow-white/20 hover:bg-gray-50 transition-all duration-300 inline-flex items-center justify-center"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                <span>Methoden entdecken</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              {!user ? (
                <button
                  onClick={openRegisterModal}
                  className="px-8 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white rounded-2xl font-semibold hover:bg-white/20 hover:border-white/50 transition-all duration-300 inline-flex items-center justify-center"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Community beitreten
                </button>
              ) : (
                <Link
                  href="/questions"
                  className="px-8 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white rounded-2xl font-semibold hover:bg-white/20 hover:border-white/50 transition-all duration-300 inline-flex items-center justify-center"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Zur Community
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <div className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Sichere Daten</div>
                <div className="text-xs text-gray-500">DSGVO-konform</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">KI-Unterstützt</div>
                <div className="text-xs text-gray-500">ChatGPT Integration</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Community-driven</div>
                <div className="text-xs text-gray-500">Von Lehrenden für Lehrende</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
