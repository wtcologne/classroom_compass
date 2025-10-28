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
  Star, 
  Lightbulb,
  Shield,
  Heart
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function HomePage() {
  const { user } = useAuth();

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

  const stats = [
    { label: 'Aktive Nutzer:innen', value: '500+', icon: Users },
    { label: 'Verfügbare Methoden', value: '150+', icon: BookOpen },
    { label: 'Gelöste Fragen', value: '1.2k+', icon: MessageCircle },
    { label: 'Durchschnittliche Bewertung', value: '4.8', icon: Star },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium mb-6">
              <Heart className="w-4 h-4 mr-2" />
              Für Lehrer:innen und Lehramtsstudierende
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Unterrichtsstörungen{' '}
              <span className="text-gradient">meistern</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Eine Plattform, die dir hilft, mit Unterrichtsstörungen umzugehen. 
              Entdecke bewährte Methoden, stelle Fragen an die Community und nutze KI-Unterstützung.
            </p>

            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/methods"
                  className="btn-primary inline-flex items-center justify-center"
                >
                  Methoden entdecken
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link
                  href="/questions"
                  className="btn-secondary inline-flex items-center justify-center"
                >
                  Community beitreten
                </Link>
              </div>
            )}

            {user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/methods"
                  className="btn-primary inline-flex items-center justify-center"
                >
                  Methodenpool erkunden
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link
                  href="/chat"
                  className="btn-secondary inline-flex items-center justify-center"
                >
                  KI-Assistent starten
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Alles was du brauchst
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Drei Bereiche, die dir helfen, souverän mit Unterrichtsstörungen umzugehen
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group card-hover"
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center text-primary-600 font-medium group-hover:text-primary-700">
                    <span>Erkunden</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Vertrauen von Tausenden
            </h2>
            <p className="text-xl text-gray-600">
              Lehrer:innen und Lehramtsstudierende nutzen Classroom Compass täglich
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Bereit für besseren Unterricht?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Schließe dich der Community an und werde Teil einer Bewegung für 
              störungsfreien und effektiven Unterricht.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/methods"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Methoden entdecken
              </Link>
              <Link
                href="/questions"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-primary-600 transition-colors inline-flex items-center justify-center"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Community beitreten
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-8 text-gray-400">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Sichere Daten</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5" />
                <span className="text-sm font-medium">KI-Unterstützt</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Community-driven</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
