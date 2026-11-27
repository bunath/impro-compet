import { describe, expect, it } from 'vitest';
import { changeFouls, changeScore, displayScore, type Teams } from './match';

const fresh = (): Teams => [
  { name: 'A', color: '#f00', score: 0, fouls: 0 },
  { name: 'B', color: '#00f', score: 0, fouls: 0 },
];

describe('match', () => {
  it('points +1 / -1 sans passer sous zéro', () => {
    let t = changeScore(fresh(), 0, 1);
    expect(t[0].score).toBe(1);
    t = changeScore(changeScore(t, 0, -1), 0, -1);
    expect(t[0].score).toBe(0);
  });
  it('3 fautes = +1 point pour l’adversaire', () => {
    let t = fresh();
    t = changeFouls(t, 0, 1);
    t = changeFouls(t, 0, 1);
    expect(t[1].score).toBe(0);
    t = changeFouls(t, 0, 1);
    expect(t[0].fouls).toBe(3);
    expect(t[1].score).toBe(1);
  });
  it('retirer une faute ne donne aucun point', () => {
    const t = changeFouls(changeFouls(fresh(), 1, 1), 1, -1);
    expect(t[1].fouls).toBe(0);
    expect(t[0].score).toBe(0);
  });
  it('mode surprise masque les points', () => {
    expect(displayScore(7, true)).toBe('?');
    expect(displayScore(7, false)).toBe('7');
  });
});
