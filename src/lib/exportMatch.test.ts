import { describe, expect, it } from 'vitest';
import { blankConfig } from './basePack';
import { buildExport, exportFileName, parseExport } from './exportMatch';
import type { LiveState } from './types';

const live: LiveState = {
  teams: [
    { name: 'A', color: '#f00', score: 2, fouls: 1 },
    { name: 'B', color: '#00f', score: 3, fouls: 0 },
  ],
  category: null,
  timerEnabled: true,
  timer: { remainingMs: 0, startedAt: null },
  halftime: { remainingMs: 0, startedAt: null, active: false, durationMs: 0 },
  message: null,
  surprise: false,
};

describe('export', () => {
  it('aller-retour JSON', () => {
    const exp = buildExport(blankConfig(), live);
    expect(parseExport(JSON.stringify(exp)).live.teams[1].score).toBe(3);
  });
  it('refuse un fichier invalide', () => {
    expect(() => parseExport('{"foo":1}')).toThrow();
  });
  it('nom de fichier propre', () => {
    expect(exportFileName(blankConfig())).toMatch(/^match-equipe-a-vs-equipe-b-\d{4}-\d{2}-\d{2}\.json$/);
  });
});
