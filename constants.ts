import { ActionType, MatchScenario } from './types';

// Professional Data Visualization Colors
export const ACTION_COLORS: Record<ActionType, string> = {
  Shot: '#ef4444', // Red 500
  Pass: '#3b82f6', // Blue 500
  Scan: '#f59e0b', // Amber 500
  Touch: '#10b981', // Emerald 500
  Reception: '#8b5cf6' // Violet 500
};

export const ACTION_GRADIENTS: Record<ActionType, string> = {
  Shot: 'from-red-500 to-red-900',
  Pass: 'from-blue-500 to-blue-900',
  Scan: 'from-amber-500 to-amber-900',
  Touch: 'from-emerald-500 to-emerald-900',
  Reception: 'from-violet-500 to-violet-900'
};

export const FIXED_SCENARIO: MatchScenario = {
  id: 'SCN-2024-M37-BAY-DOR',
  name: 'FC Bayern vs Dortmund (Min 37)',
  context: 'Press start when you are ready.',
  targets: {
    Pass: 14,
    Shot: 1,
    Scan: 18,
    Touch: 5,
    Reception: 10
  }
};