# 🎯 Classroom Compass

Eine moderne Plattform für Lehrer:innen und Lehramtsstudierende zum Umgang mit Unterrichtsstörungen. Mit Methodenpool, Community-Fragen und KI-Assistent.

![Classroom Compass](https://img.shields.io/badge/Next.js-14.0.3-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-2.38.4-green?style=for-the-badge&logo=supabase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🗂️ Methodenpool
- Sammlung bewährter Strategien gegen Unterrichtsstörungen
- Such- und Filterfunktion nach Kategorien und Tags
- Kommentare und Sterne-Bewertungen (1-5 Sterne)
- Möglichkeit, eigene Methoden einzureichen
- **🔖 Favoriten**: Markiere wichtige Methoden als Favoriten
- Filter für "Meine Methoden" und "Favoriten"

### 💬 Frag die Crowd
- **Anonyme Fragen** an die Community stellen
- Antworten von erfahrenen Kolleg:innen erhalten
- Upvote-System für hilfreiche Fragen und Antworten
- Sortierung nach Neuigkeit, Beliebtheit
- **🔖 Favoriten**: Speichere wichtige Fragen
- Filter für "Meine Fragen" und "Favoriten"

### 🤖 KI-Assistent
- ChatGPT-Integration für innovative Lösungsansätze
- Speziell trainiert für Unterrichtsstörungen
- Praktische Tipps und Methoden
- Interaktives Chat-Interface

### 👤 Authentifizierung
- Supabase Auth mit E-Mail-Registrierung
- Benutzerprofile mit Punkte-System
- Rollenbasierte Berechtigung (User/Admin)

## 🚀 Quick Start

### Voraussetzungen
- Node.js 18+ 
- npm oder yarn
- Supabase-Projekt
- OpenAI API-Schlüssel

### 1. Repository klonen
```bash
git clone <repository-url>
cd classroom_compass
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Environment Variables konfigurieren
Erstelle eine `.env.local` Datei im Root-Verzeichnis:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Optional: Supabase Service Role Key (für Admin-Operationen)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Supabase-Datenbank einrichten
1. Erstelle ein neues Supabase-Projekt
2. Öffne den **SQL Editor** in deinem Supabase Dashboard
3. Führe die Migrations aus:
   - **Schnellstart**: `migrations/00-complete-setup.sql` (empfohlen - alles in einem)
   - **Schrittweise**: Die einzelnen Dateien in `migrations/` in nummerischer Reihenfolge
4. Fertig! RLS ist automatisch aktiviert

### 5. Entwicklungsserver starten
```bash
npm run dev
```

Die Anwendung ist jetzt unter [http://localhost:3000](http://localhost:3000) verfügbar.

## 🗄️ Datenbank-Schema

### Haupttabellen
- **profiles**: Benutzerprofile mit Rollen und Punkten
- **methods**: Unterrichtsmethoden mit Bewertungen
- **questions**: Community-Fragen (anonym möglich)
- **answers**: Antworten auf Fragen
- **comments**: Kommentare und Bewertungen zu Methoden

### Interaktions-Tabellen
- **question_upvotes**: Upvotes für Fragen
- **answer_upvotes**: Upvotes für Antworten
- **method_ratings**: Bewertungen für Methoden (1-5 Sterne)
- **question_favorites**: Favorisierte Fragen
- **method_favorites**: Favorisierte Methoden

### Sicherheit
- Row Level Security (RLS) aktiviert für alle Tabellen
- Automatische Profilerstellung bei Registrierung
- Rollenbasierte Zugriffskontrolle
- User können nur eigene Daten bearbeiten/löschen

## 🎨 Design-System

### Apple-like Design
- Minimalistisches, sauberes Interface
- Konsistente Farbpalette (Primary Blue)
- Sanfte Animationen und Übergänge
- Responsive Design für alle Geräte

### Komponenten
- **MethodCard**: Darstellung von Unterrichtsmethoden
- **QuestionCard**: Community-Fragen mit Metadaten
- **ChatBox**: Interaktives Chat-Interface
- **Navigation**: Responsive Navigation mit Auth-Integration

## 📁 Projektstruktur

```
classroom_compass/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── chat/          # OpenAI Chat API
│   ├── chat/              # KI-Assistent Seite
│   ├── methods/           # Methodenpool Seite
│   ├── questions/         # Frag die Crowd Seite
│   ├── globals.css        # Globale Styles
│   ├── icon.svg           # App Icon
│   ├── layout.tsx         # Root Layout
│   └── page.tsx          # Homepage
├── components/            # React Komponenten
│   ├── AuthProvider.tsx   # Auth Context
│   ├── ChatBox.tsx        # Chat Interface
│   ├── LoginModal.tsx     # Login Modal
│   ├── MethodCard.tsx     # Methoden-Karte
│   ├── MethodDetailModal.tsx # Methoden-Detail Ansicht
│   ├── Navigation.tsx     # Hauptnavigation
│   ├── QuestionCard.tsx   # Fragen-Karte
│   ├── QuestionDetailModal.tsx # Fragen-Detail Ansicht
│   └── RegisterModal.tsx  # Registrierung Modal
├── lib/                   # Utilities
│   ├── database.types.ts # Supabase Types
│   └── supabaseClient.ts  # Supabase Client
├── migrations/            # 📦 Datenbank-Migrations
│   ├── 00-complete-setup.sql # Komplett-Setup (empfohlen)
│   ├── 01-schema.sql      # Basis-Schema
│   ├── 02-interactions.sql # Upvotes & Ratings
│   ├── 03-favorites.sql   # Favoriten-System
│   ├── 04-fix-anonymous-questions.sql
│   ├── 05-verify-permissions.sql
│   └── README.md         # Migrations-Dokumentation
├── types/                 # TypeScript Types
│   └── index.ts          # App-spezifische Types
└── README.md             # Diese Datei
```

## 🔧 Entwicklung

### Verfügbare Scripts
```bash
npm run dev      # Entwicklungsserver starten
npm run build    # Produktions-Build erstellen
npm run start    # Produktions-Server starten
npm run lint     # ESLint ausführen
```

### Code-Qualität
- TypeScript für Typsicherheit
- ESLint für Code-Qualität
- TailwindCSS für konsistentes Styling
- Responsive Design-Prinzipien

## 🚀 Deployment

### Schnellstart
Siehe [DEPLOYMENT.md](DEPLOYMENT.md) für eine ausführliche Schritt-für-Schritt-Anleitung.

### Kurzanleitung:
1. **GitHub**: `git push origin main`
2. **Vercel**: Repository verbinden
3. **Environment Variables** in Vercel konfigurieren:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
4. **Deploy** - automatisch nach jedem Git Push

### ⚠️ Wichtig: API-Keys sind sicher!
- `.env.local` wird nie zu Git hinzugefügt (in `.gitignore`)
- Alle Keys werden nur in Vercel konfiguriert
- Siehe [DEPLOYMENT.md](DEPLOYMENT.md) für Details

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/amazing-feature`)
3. Committe deine Änderungen (`git commit -m 'Add amazing feature'`)
4. Push zum Branch (`git push origin feature/amazing-feature`)
5. Öffne einen Pull Request

## 📝 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe [LICENSE](LICENSE) für Details.

## 🙏 Danksagungen

- [Next.js](https://nextjs.org/) für das React-Framework
- [Supabase](https://supabase.com/) für Backend-as-a-Service
- [OpenAI](https://openai.com/) für die KI-Integration
- [TailwindCSS](https://tailwindcss.com/) für das Styling
- [Lucide React](https://lucide.dev/) für die Icons

## 📞 Support

Bei Fragen oder Problemen:
- Erstelle ein [Issue](https://github.com/your-repo/issues)
- Kontaktiere das Entwicklungsteam
- Schaue in die [Dokumentation](https://docs.classroom-compass.com)

---

**Entwickelt mit ❤️ für Lehrer:innen und Lehramtsstudierende**
