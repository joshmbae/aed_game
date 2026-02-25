import { ActionType, MatchScenario } from './types';

// Professional Data Visualization Colors
export const ACTION_COLORS: Record<ActionType, string> = {
  Touch: '#10b981', // Emerald 500
  Pass: '#3b82f6', // Blue 500
  Shot: '#ef4444', // Red 500
  Duel: '#f97316', // Orange 500
  Carry: '#a855f7' // Violet 500
};

export const ACTION_GRADIENTS: Record<ActionType, string> = {
  Touch: 'from-emerald-500 to-emerald-900',
  Pass: 'from-blue-500 to-blue-900',
  Shot: 'from-red-500 to-red-900',
  Duel: 'from-orange-500 to-orange-900',
  Carry: 'from-violet-500 to-violet-900'
};

export const FIXED_SCENARIO: MatchScenario = {
  id: 'SCN-2024-M37-KOL-BAY',
  name: '1. FC Köln vs FC Bayern München (45+4)',
  context: 'Press start when you are ready.',
  targets: {
    Touch: 33,
    Pass: 11,
    Shot: 2,
    Duel: 7,
    Carry: 2
  },
  videoUrl: '/AED_activation_withCountDown.mp4'
};  