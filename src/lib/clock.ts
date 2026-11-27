import type { Clock } from './types';

export const remainingMs = (c: Clock, now: number): number =>
  Math.max(0, c.remainingMs - (c.startedAt === null ? 0 : now - c.startedAt));

export const isRunning = (c: Clock): boolean => c.startedAt !== null;

export const startClock = <C extends Clock>(c: C, now: number): C =>
  c.startedAt !== null || c.remainingMs <= 0 ? c : { ...c, startedAt: now };

export const pauseClock = <C extends Clock>(c: C, now: number): C => ({
  ...c,
  remainingMs: remainingMs(c, now),
  startedAt: null,
});

export const addToClock = <C extends Clock>(c: C, deltaMs: number, now: number): C => ({
  ...c,
  remainingMs: Math.max(0, remainingMs(c, now) + deltaMs),
  startedAt: c.startedAt === null ? null : now,
});

export const setClock = <C extends Clock>(c: C, ms: number): C => ({
  ...c,
  remainingMs: ms,
  startedAt: null,
});

const pad = (n: number) => String(n).padStart(2, '0');

export function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}
