import { describe, expect, it } from 'vitest';
import { addToClock, formatClock, pauseClock, remainingMs, startClock } from './clock';

const base = { remainingMs: 60_000, startedAt: null };

describe('clock', () => {
  it('décompte quand il tourne', () => {
    const c = startClock(base, 1000);
    expect(remainingMs(c, 11_000)).toBe(50_000);
  });
  it('ne descend jamais sous zéro', () => {
    expect(remainingMs(startClock(base, 0), 999_999)).toBe(0);
  });
  it('pause fige le temps restant', () => {
    const paused = pauseClock(startClock(base, 0), 15_000);
    expect(paused).toEqual({ remainingMs: 45_000, startedAt: null });
  });
  it('ajoute et retire du temps en cours de route', () => {
    const c = addToClock(startClock(base, 0), 10_000, 20_000);
    expect(remainingMs(c, 20_000)).toBe(50_000);
    expect(addToClock(base, -999_000, 0).remainingMs).toBe(0);
  });
  it('formate mm:ss', () => {
    expect(formatClock(90_000)).toBe('01:30');
    expect(formatClock(59_100)).toBe('01:00');
    expect(formatClock(0)).toBe('00:00');
  });
});
