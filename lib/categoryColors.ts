/**
 * Category Color Utility
 * Definiert die Farbkodierung für verschiedene Methodenkategorien
 */

export type CategoryColor = {
  bg: string;
  text: string;
  border?: string;
};

/**
 * Gibt die passende Farbe für eine Kategorie zurück
 * WICHTIG: Alle Farbklassen müssen hier explizit aufgelistet werden,
 * damit Tailwind sie beim Scannen erkennt.
 */
export function getCategoryColor(category: string): CategoryColor {
  switch (category) {
    case 'Prävention':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
      };
    case 'Sofortmaßnahmen':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
      };
    case 'Langfristige Strategien':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
      };
    case 'Kommunikation':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
      };
    case 'Klassenmanagement':
      return {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
      };
    case 'Verhaltensmodifikation':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
      };
    case 'Motivation':
      return {
        bg: 'bg-pink-50',
        text: 'text-pink-700',
        border: 'border-pink-200',
      };
    case 'Gruppenarbeit':
      return {
        bg: 'bg-teal-50',
        text: 'text-teal-700',
        border: 'border-teal-200',
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
      };
  }
}
