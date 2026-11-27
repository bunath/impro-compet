import type { MatchConfig, ResourcePack } from './types';
import { uid } from './id';

/** Pack embarqué : sert au premier lancement quand le serveur est fermé (22h–7h). */
export const BASE_PACK: ResourcePack = {
  id: 'base',
  name: 'Pack de base',
  version: 1,
  description: 'Catégories, temps et messages classiques d’un match d’improvisation.',
  categories: [
    ['libre', 'Libre'],
    ['comparee', 'Comparée'],
    ['mixte', 'Mixte'],
    ['cantonnee', 'Cantonnée'],
    ['chantee', 'Chantée'],
    ['sans-paroles', 'Sans paroles'],
    ['chaine', 'Chaînée'],
    ['theme', 'Thème imposé'],
  ].map(([id, name]) => ({ id: `base-${id}`, name, origin: 'pack' as const })),
  timePresets: [30, 60, 90, 120, 180, 300].map((s) => ({
    id: `base-t${s}`,
    label: `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`,
    seconds: s,
  })),
  messagePresets: [
    ['Merci au public !', 5],
    ['Vote du public', 8],
    ['Pause technique', 10],
    ['Changement de joueurs', 8],
  ].map(([text, seconds]) => ({
    id: `base-m${seconds}-${text}`,
    text: String(text),
    seconds: Number(seconds),
  })),
};

export function blankConfig(): MatchConfig {
  return {
    id: uid(),
    name: 'Nouveau match',
    packId: null,
    teams: [
      { id: uid(), name: 'Équipe A', color: '#ff5d73' },
      { id: uid(), name: 'Équipe B', color: '#3ea6ff' },
    ],
    categories: [],
    allowNoCategory: true,
    timePresets: [],
    halftimeSeconds: 15 * 60,
    messagePresets: [],
    updatedAt: Date.now(),
  };
}

export function configFromPack(pack: ResourcePack): MatchConfig {
  return {
    ...blankConfig(),
    packId: pack.id,
    categories: pack.categories,
    timePresets: pack.timePresets,
    messagePresets: pack.messagePresets,
  };
}
