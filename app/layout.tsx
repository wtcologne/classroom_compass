/**
 * Root Layout Component
 * Haupt-Layout mit AuthProvider und globalen Styles
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { ModalProvider } from '@/components/ModalContext';
import { Navigation } from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Classroom Compass - Unterrichtsstörungen meistern',
  description: 'Eine Plattform für Lehrer:innen und Lehramtsstudierende zum Umgang mit Unterrichtsstörungen. Methodenpool, Community-Fragen und KI-Assistent.',
  keywords: 'Unterrichtsstörungen, Lehrer, Lehramt, Methoden, KI-Assistent, Community',
  authors: [{ name: 'Classroom Compass Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="de" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <AuthProvider>
          <ModalProvider>
            <div className="min-h-full">
              <Navigation />
              <main className="flex-1">
                {children}
              </main>
            
            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center text-gray-600">
                  <p className="text-sm">
                    © 2024 Classroom Compass. Entwickelt für Lehrer:innen und Lehramtsstudierende.
                  </p>
                  <p className="text-xs mt-2 text-gray-500">
                    Mit ❤️ für besseren Unterricht
                  </p>
                </div>
              </div>
            </footer>
            </div>
          </ModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
