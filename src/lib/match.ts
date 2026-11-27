import type { LiveTeam } from './types';

export type TeamIndex = 0 | 1;
export type Teams = [LiveTeam, LiveTeam];

/** Une pénalité (+1 point à l'adversaire) tous les 3 fautes. */
export const FOULS_PER_PENALTY = 3;

export const opponent = (i: TeamIndex): TeamIndex => (i === 0 ? 1 : 0);

const mapTeams = (teams: Teams, fn: (t: LiveTeam, i: TeamIndex) => LiveTeam): Teams => [
  fn(teams[0], 0),
  fn(teams[1], 1),
];

export function changeScore(teams: Teams, index: TeamIndex, delta: number): Teams {
  return mapTeams(teams, (t, i) =>
    i === index ? { ...t, score: Math.max(0, t.score + delta) } : t,
  );
}

/** +1 faute : à chaque 3e faute, l'équipe adverse gagne 1 point. -1 faute ne retire aucun point. */
export function changeFouls(teams: Teams, index: TeamIndex, delta: number): Teams {
  const fouls = Math.max(0, teams[index].fouls + delta);
  const penalty = delta > 0 && fouls % FOULS_PER_PENALTY === 0;
  return mapTeams(teams, (t, i) => {
    if (i === index) return { ...t, fouls };
    return penalty ? { ...t, score: t.score + 1 } : t;
  });
}

/** Valeur affichée côté spectateur (mode surprise = "?"). */
export const displayScore = (score: number, surprise: boolean): string =>
  surprise ? '?' : String(score);
