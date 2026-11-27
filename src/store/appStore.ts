import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/lib/types';

export type Screen = 'splash' | 'download' | 'welcome' | 'auth' | 'packs' | 'setup' | 'console';

interface AppState {
  screen: Screen;
  go: (screen: Screen) => void;
  // persisté
  firstRunDone: boolean;
  serverUrl: string;
  user: User | null;
  token: string | null;
  completeFirstRun: () => void;
  setServerUrl: (url: string) => void;
  signIn: (user: User, token: string) => void;
  signOut: () => void;
}

export const DEFAULT_SERVER_URL = 'https://CHANGE-ME.tailnet-name.ts.net';

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      screen: 'splash',
      go: (screen) => set({ screen }),
      firstRunDone: false,
      serverUrl: DEFAULT_SERVER_URL,
      user: null,
      token: null,
      completeFirstRun: () => set({ firstRunDone: true }),
      setServerUrl: (serverUrl) => set({ serverUrl: serverUrl.replace(/\/+$/, '') }),
      signIn: (user, token) => set({ user, token }),
      signOut: () => set({ user: null, token: null }),
    }),
    {
      name: 'impro-app',
      partialize: ({ firstRunDone, serverUrl, user, token }) => ({
        firstRunDone,
        serverUrl,
        user,
        token,
      }),
    },
  ),
);
