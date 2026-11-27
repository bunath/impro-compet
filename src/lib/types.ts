export type Id = string;

export interface User {
  id: Id;
  username: string;
  email: string;
}
export interface Team {
  id: Id;
  name: string;
  color: string;
}
export interface Category {
  id: Id;
  name: string;
  description?: string;
  origin: 'pack' | 'custom';
}
export interface TimePreset {
  id: Id;
  label: string;
  seconds: number;
}
export interface MessagePreset {
  id: Id;
  text: string;
  seconds: number;
}

/** Pack de ressources distribué par le serveur (ou embarqué hors-ligne). */
export interface ResourcePack {
  id: Id;
  name: string;
  version: number;
  description: string;
  categories: Category[];
  timePresets: TimePreset[];
  messagePresets: MessagePreset[];
}

/** Configuration préparée avant le match. Les catégories sont copiées : fonctionne hors-ligne. */
export interface MatchConfig {
  id: Id;
  name: string;
  packId: Id | null;
  teams: [Team, Team];
  categories: Category[];
  allowNoCategory: boolean;
  timePresets: TimePreset[];
  halftimeSeconds: number;
  messagePresets: MessagePreset[];
  updatedAt: number;
}

/** Chrono : `startedAt` = horodatage de démarrage, null si en pause. */
export interface Clock {
  remainingMs: number;
  startedAt: number | null;
}
export interface HalftimeClock extends Clock {
  active: boolean;
  durationMs: number;
}
export interface LiveTeam {
  name: string;
  color: string;
  score: number;
  fouls: number;
}
export interface LiveMessage {
  text: string;
  endsAt: number;
}

/** État temps réel partagé entre la régie et la vue spectateur. */
export interface LiveState {
  teams: [LiveTeam, LiveTeam];
  category: string | null;
  timerEnabled: boolean;
  timer: Clock;
  halftime: HalftimeClock;
  message: LiveMessage | null;
  surprise: boolean;
}

export interface MatchExport {
  version: 1;
  exportedAt: string;
  config: MatchConfig;
  live: LiveState;
}
