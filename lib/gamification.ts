/**
 * Gamification & Points System
 * Helper-Funktionen für Level-Berechnung und Badges
 */

export interface LevelInfo {
  level: number;
  name: string;
  emoji: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  bgColor: string;
  progress: number; // 0-100
  pointsToNext: number;
}

const LEVELS = [
  {
    level: 1,
    name: 'Einsteiger:in',
    emoji: '🐣',
    minPoints: 0,
    maxPoints: 49,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  {
    level: 2,
    name: 'Aktive:r Lehrer:in',
    emoji: '🌱',
    minPoints: 50,
    maxPoints: 149,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    level: 3,
    name: 'Erfahrene:r Kolleg:in',
    emoji: '🔥',
    minPoints: 150,
    maxPoints: 299,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    level: 4,
    name: 'Methoden-Coach',
    emoji: '🧩',
    minPoints: 300,
    maxPoints: 599,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    level: 5,
    name: 'Didaktik-Meister:in',
    emoji: '🏆',
    minPoints: 600,
    maxPoints: Infinity,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
];

/**
 * Berechnet Level-Informationen basierend auf Punkten
 */
export function getUserLevel(points: number): LevelInfo {
  // Finde das passende Level
  const currentLevel = LEVELS.find(
    level => points >= level.minPoints && points <= level.maxPoints
  ) || LEVELS[0];

  // Berechne Progress zum nächsten Level
  const pointsInLevel = points - currentLevel.minPoints;
  const pointsNeededForLevel = currentLevel.maxPoints === Infinity 
    ? 100 // Max level erreicht
    : currentLevel.maxPoints - currentLevel.minPoints + 1;
  
  const progress = currentLevel.maxPoints === Infinity
    ? 100
    : Math.min(100, (pointsInLevel / pointsNeededForLevel) * 100);

  const pointsToNext = currentLevel.maxPoints === Infinity
    ? 0
    : currentLevel.maxPoints - points + 1;

  return {
    ...currentLevel,
    progress: Math.round(progress),
    pointsToNext,
  };
}

/**
 * Punkte-Aktivitäten
 */
export const POINT_ACTIVITIES = {
  METHOD_POST: { points: 1, label: 'Neue Methode', emoji: '🧠' },
  QUESTION_POST: { points: 1, label: 'Neue Frage', emoji: '💬' },
  ANSWER_POST: { points: 1, label: 'Antwort', emoji: '💡' },
  RECEIVED_UPVOTE: { points: 1, label: 'Upvote erhalten', emoji: '👍' },
  RECEIVED_RATING: { points: 1, label: 'Rating erhalten', emoji: '⭐' },
};

/**
 * Formatiert Punkte mit Tausender-Trennung
 */
export function formatPoints(points: number): string {
  return points.toLocaleString('de-DE');
}

/**
 * Gibt alle Level zurück (für Anzeige)
 */
export function getAllLevels() {
  return LEVELS;
}

