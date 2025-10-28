# 🚀 Deployment-Anleitung: Classroom Compass

## 📋 Überblick

Diese Anleitung erklärt, wie du Classroom Compass zu GitHub pushen und auf Vercel deployen kannst, ohne deine API-Keys zu veröffentlichen.

---

## ✅ Schritt 1: Projekt zu GitHub pushen

### 1.1 GitHub Repository erstellen

1. Gehe zu [GitHub](https://github.com) und erstelle ein neues Repository
2. **Nicht** initialisieren (kein README, .gitignore, etc. - das haben wir schon)

### 1.2 Repository verknüpfen und pushen

```bash
# Git Repository initialisieren (falls noch nicht geschehen)
git init

# Alle Dateien hinzufügen
git add .

# Ersten Commit erstellen
git commit -m "Initial commit: Classroom Compass - Unterrichtsstörungen Plattform"

# Haupt-Branch umbenennen (optional, aber empfohlen)
git branch -M main

# GitHub Repository hinzufügen (ersetze YOUR_USERNAME mit deinem GitHub-Username)
git remote add origin https://github.com/YOUR_USERNAME/classroom-compass.git

# Zu GitHub pushen
git push -u origin main
```

### ✅ Wichtig: API-Keys sind sicher!

- `.env.local` ist in `.gitignore` → wird NICHT hochgeladen
- Alle API-Keys bleiben lokal auf deinem Rechner

---

## 🌐 Schritt 2: Auf Vercel deployen

### 2.1 Vercel Account erstellen

1. Gehe zu [Vercel](https://vercel.com)
2. Erstelle einen Account oder logge dich ein

### 2.2 Projekt zu Vercel hinzufügen

1. Klicke auf **"Add New"** → **"Project"**
2. Verbinde dein GitHub-Account (wenn noch nicht geschehen)
3. Wähle dein **classroom-compass** Repository
4. Klicke auf **"Import"**

### 2.3 ⚠️ Environment Variables konfigurieren (WICHTIG!)

**Das ist der wichtigste Schritt!**

1. Vor dem Deploy: Scrolle nach unten zu **"Environment Variables"**
2. Füge diese Variablen hinzu:

```
NEXT_PUBLIC_SUPABASE_URL = https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = dein_anon_key
OPENAI_API_KEY = dein_openai_key
```

#### 📝 Wo finde ich die Werte?

**Supabase:**
1. Gehe zu [Supabase Dashboard](https://app.supabase.com)
2. Wähle dein Projekt
3. Gehe zu **Settings** → **API**
4. Kopiere "Project URL" und "anon/public key"

**OpenAI:**
1. Gehe zu [OpenAI Platform](https://platform.openai.com)
2. Navigiere zu **API Keys**
3. Erstelle einen neuen Key oder verwende einen existierenden

### 2.4 Deploy starten

1. Klicke auf **"Deploy"**
2. Warte ~2 Minuten
3. Fertig! ✨

---

## 🔧 Schritt 3: Datenbank einrichten

### 3.1 Supabase SQL ausführen

1. Gehe zu deinem [Supabase Dashboard](https://app.supabase.com)
2. Navigiere zu **SQL Editor**
3. Klicke auf **"New query"**
4. Kopiere den Inhalt von `migrations/00-complete-setup.sql`
5. Füge ihn ein und klicke auf **"Run"**
6. Warte bis das Setup fertig ist

### 3.2 Fertig!

Die Datenbank ist jetzt eingerichtet und deine App läuft live! 🎉

---

## 📊 Schritt 4: Überprüfen

### App testen:
1. Öffne deine Vercel-URL (z.B. `https://classroom-compass.vercel.app`)
2. Teste die Registrierung
3. Teste das Erstellen einer Methode
4. Teste das Erstellen einer Frage
5. Teste den Chat mit dem KI-Assistenten

---

## 🔄 Weitere Deployments

Jedes Mal, wenn du zu GitHub pushst, deployt Vercel automatisch neu!

```bash
git add .
git commit -m "Deine Änderungsbeschreibung"
git push
```

Vercel erkennt automatisch den Push und startet ein neues Deployment.

---

## ⚙️ Vercel-Konfiguration

### Umgebungsvariablen ändern

1. Gehe zu deinem Projekt auf [Vercel](https://vercel.com)
2. Klicke auf **Settings**
3. Gehe zu **Environment Variables**
4. Bearbeite, lösche oder füge neue Variablen hinzu
5. Klicke auf **"Redeploy"** um die Änderungen anzuwenden

### Domäne anpassen

1. Gehe zu **Settings** → **Domains**
2. Füge eine Custom Domain hinzu (z.B. `classroom-compass.de`)
3. Befolge die DNS-Anweisungen von Vercel

---

## 🛡️ Sicherheit

### ✅ Was ist sicher:
- `.env.local` wird nie hochgeladen
- API-Keys sind nur in Vercel gespeichert
- Backups werden automatisch erstellt

### ⚠️ Was du vermeiden solltest:
- ❌ API-Keys niemals in Code committen
- ❌ API-Keys nicht in Screenshots teilen
- ❌ Private Keys nicht in Slack/Discord posten

---

## 🐛 Troubleshooting

### "Module not found" Fehler
```bash
# Lokal testen:
npm install
npm run build
```

### "API Key invalid" Fehler
- Überprüfe die Environment Variables in Vercel
- Stelle sicher, dass alle Keys korrekt sind
- Redeploy nach Änderungen

### "Database connection failed"
- Überprüfe Supabase-Settings
- Stelle sicher, dass der SQL-Code ausgeführt wurde
- Prüfe die `NEXT_PUBLIC_SUPABASE_URL`

---

## 📚 Nützliche Links

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Deploy**: https://nextjs.org/docs/deployment
- **GitHub**: https://github.com

---

**Viel Erfolg beim Deployen! 🚀**

