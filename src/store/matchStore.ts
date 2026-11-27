import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addToClock, pauseClock, setClock, startClock } from '@/lib/clock';
import { changeFouls, changeScore, type TeamIndex } from '@/lib/match';
import type { LiveState, MatchConfig } from '@/lib/types';

export const initialLive = (config?: MatchConfig): LiveState => ({
  teams: [
    { name: config?.teams[0].name ?? 'Équipe A', color: config?.teams[0].color ?? '#ff5d73', score: 0, fouls: 0 },
    { name: config?.teams[1].name ?? 'Équipe B', color: config?.teams[1].color ?? '#3ea6ff', score: 0, fouls: 0 },
  ],
  category: null,
  timerEnabled: true,
  timer: { remainingMs: 0, startedAt: null },
  halftime: {
    remainingMs: (config?.halftimeSeconds ?? 900) * 1000,
    durationMs: (config?.halftimeSeconds ?? 900) * 1000,
    startedAt: null,
    active: false,
  },
  message: null,
  surprise: false,
});

interface MatchState {
  live: LiveState;
  loadConfig: (config: MatchConfig) => void;
  setTeamName: (i: TeamIndex, name: string) => void;
  addPoint: (i: TeamIndex, delta: 1 | -1) => void;
  addFoul: (i: TeamIndex, delta: 1 | -1) => void;
  selectCategory: (name: string | null) => void;
  toggleTimerEnabled: () => void;
  toggleTimerRun: () => void;
  addTime: (seconds: number) => void;
  setTimer: (seconds: number) => void;
  setHalftimeDuration: (seconds: number) => void;
  toggleHalftime: () => void;
  stopHalftime: () => void;
  showMessage: (text: string, seconds: number) => void;
  clearMessage: () => void;
  toggleSurprise: () => void;
  stopClocksIfElapsed: (now: number) => void;
}

export const useMatchStore = create<MatchState>()(
  persist(
    (set) => {
      const patch = (fn: (l: LiveState) => Partial<LiveState>) =>
        set((s) => ({ live: { ...s.live, ...fn(s.live) } }));
      return {
        live: initialLive(),
        loadConfig: (config) => set({ live: initialLive(config) }),
        setTeamName: (i, name) =>
          patch((l) => ({
            teams: l.teams.map((t, k) => (k === i ? { ...t, name } : t)) as LiveState['teams'],
          })),
        addPoint: (i, d) => patch((l) => ({ teams: changeScore(l.teams, i, d) })),
        addFoul: (i, d) => patch((l) => ({ teams: changeFouls(l.teams, i, d) })),
        selectCategory: (category) => patch(() => ({ category })),
        toggleTimerEnabled: () =>
          patch((l) => ({
            timerEnabled: !l.timerEnabled,
            timer: pauseClock(l.timer, Date.now()),
          })),
        toggleTimerRun: () =>
          patch((l) => {
            const now = Date.now();
            return { timer: l.timer.startedAt === null ? startClock(l.timer, now) : pauseClock(l.timer, now) };
          }),
        addTime: (seconds) => patch((l) => ({ timer: addToClock(l.timer, seconds * 1000, Date.now()) })),
        setTimer: (seconds) => patch((l) => ({ timer: setClock(l.timer, seconds * 1000) })),
        setHalftimeDuration: (seconds) =>
          patch((l) => ({
            halftime: { ...setClock(l.halftime, seconds * 1000), durationMs: seconds * 1000, active: false },
          })),
        toggleHalftime: () =>
          patch((l) => {
            const now = Date.now();
            const h = l.halftime;
            if (h.startedAt !== null) return { halftime: pauseClock(h, now) };
            const fresh = h.remainingMs <= 0 ? setClock(h, h.durationMs) : h;
            return { halftime: { ...startClock(fresh, now), active: true } };
          }),
        stopHalftime: () =>
          patch((l) => ({ halftime: { ...setClock(l.halftime, l.halftime.durationMs), active: false } })),
        showMessage: (text, seconds) => patch(() => ({ message: { text, endsAt: Date.now() + seconds * 1000 } })),
        clearMessage: () => patch(() => ({ message: null })),
        toggleSurprise: () => patch((l) => ({ surprise: !l.surprise })),
        stopClocksIfElapsed: (now) =>
          set((s) => {
            const { timer, halftime } = s.live;
            const timerDone = timer.startedAt !== null && now - timer.startedAt >= timer.remainingMs;
            const halfDone = halftime.startedAt !== null && now - halftime.startedAt >= halftime.remainingMs;
            if (!timerDone && !halfDone) return s;
            return {
              live: {
                ...s.live,
                timer: timerDone ? pauseClock(timer, now) : timer,
                halftime: halfDone ? pauseClock(halftime, now) : halftime,
              },
            };
          }),
      };
    },
    {
      name: 'impro-live',
      // Reprise après crash : les chronos redémarrent en pause, rien n'est perdu côté scores.
      merge: (persisted, current) => {
        const live = (persisted as Partial<MatchState> | undefined)?.live;
        if (!live) return current;
        return {
          ...current,
          live: {
            ...live,
            timer: { ...live.timer, startedAt: null },
            halftime: { ...live.halftime, startedAt: null },
          },
        };
      },
      partialize: (s) => ({ live: s.live }) as MatchState,
    },
  ),
);
