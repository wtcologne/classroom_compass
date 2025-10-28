# Database Migrations

Dieser Ordner enthält alle SQL-Migrations-Dateien für die Classroom Compass Datenbank.

## 🚀 Schnellstart

Wenn du die Datenbank von Grund auf neu einrichten willst, führe einfach diese Datei aus:

```sql
00-complete-setup.sql
```

Diese enthält alle notwendigen Befehle in der richtigen Reihenfolge.

## 📋 Migrations-Dateien

### Einzelne Migrations (optional)

Falls du die Datenbank schrittweise aufbauen oder nur bestimmte Features hinzufügen möchtest:

| Datei | Beschreibung |
|-------|-------------|
| `01-schema.sql` | **Basis-Schema**: Erstellt alle Haupttabellen (profiles, methods, questions, answers, comments) |
| `02-interactions.sql` | **Interaktionen**: Fügt Upvotes und Ratings hinzu (question_upvotes, answer_upvotes, method_ratings) |
| `03-favorites.sql` | **Favoriten**: Ermöglicht das Markieren von Fragen und Methoden als Favoriten |
| `04-fix-anonymous-questions.sql` | **Anonyme Fragen Fix**: Passt die Policies für anonyme Fragen an |
| `05-verify-permissions.sql` | **Permissions Verification**: Prüft ob alle Berechtigungen korrekt gesetzt sind |

## 🔄 Ausführungsreihenfolge

**Option 1: Komplett-Setup (empfohlen)**
```
00-complete-setup.sql (alles in einem)
```

**Option 2: Schrittweise**
```
01-schema.sql
02-interactions.sql
03-favorites.sql
04-fix-anonymous-questions.sql (optional)
05-verify-permissions.sql (optional)
```

## 📝 Hinweise

- Alle Dateien sind idempotent (können mehrfach ausgeführt werden)
- Die `00-complete-setup.sql` ist immer aktuell und enthält alle Features
- Bei Problemen: Lösche die Tabellen und führe `00-complete-setup.sql` erneut aus

## 🛠️ Supabase Dashboard

1. Öffne dein Supabase Dashboard
2. Navigiere zu **SQL Editor**
3. Klicke auf **New query**
4. Kopiere den Inhalt von `00-complete-setup.sql`
5. Klicke auf **Run**

## ⚠️ Wichtig

- **Backup erstellen** bevor du Migrations ausführst
- Die Dateien setzen Supabase Auth voraus
- RLS (Row Level Security) ist aktiviert für alle Tabellen

