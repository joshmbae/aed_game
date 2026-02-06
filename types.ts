export type ActionType = "Reception" | "Touch" | "Pass" | "Shot" | "Scan";

export const ACTIONS: ActionType[] = ["Reception", "Touch", "Pass", "Shot", "Scan"];

export interface MatchScenario {
  id: string;
  name: string;
  context: string;
  targets: Record<ActionType, number>;
}

export interface HistoryEvent {
  id: string;
  action: ActionType;
  timestamp: number;
}

export interface SessionRecord {
  id: string;
  operatorName: string;
  timestamp: number;
  scenarioId: string;
  totalEvents: number;
  totalVariance: number;
  counts: Record<ActionType, number>;
  targets: Record<ActionType, number>;
}

export enum ViewState {
  IDLE = 'idle',
  INPUT = 'input',
  ACTIVE = 'active',
  ANALYSIS = 'analysis',
  LEADERBOARD = 'leaderboard'
}