import { describe, expect, it } from 'vitest';
import { isServerOpen } from './serverHours';

// Janvier : Paris = UTC+1
describe('isServerOpen', () => {
  it('ouvert à 22h30', () => expect(isServerOpen(new Date('2026-01-15T21:30:00Z'))).toBe(true));
  it('ouvert à 6h59', () => expect(isServerOpen(new Date('2026-01-16T05:59:00Z'))).toBe(true));
  it('fermé à 7h00', () => expect(isServerOpen(new Date('2026-01-16T06:00:00Z'))).toBe(false));
  it('fermé en journée', () => expect(isServerOpen(new Date('2026-01-15T11:00:00Z'))).toBe(false));
  it('fermé à 21h59', () => expect(isServerOpen(new Date('2026-01-15T20:59:00Z'))).toBe(false));
});
