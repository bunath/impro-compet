import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { blankConfig } from '@/lib/basePack';
import type { MatchConfig, ResourcePack } from '@/lib/types';

interface PendingOp {
  id: string;
  config: MatchConfig;
}

interface LibraryState {
  pack: ResourcePack | null;
  config: MatchConfig;
  savedConfigs: MatchConfig[];
  /** Configurations à envoyer au serveur dès qu'il est disponible (22h–7h). */
  pending: PendingOp[];
  setPack: (pack: ResourcePack) => void;
  setConfig: (config: MatchConfig) => void;
  patchConfig: (patch: Partial<MatchConfig>) => void;
  saveLocal: () => MatchConfig;
  enqueue: (config: MatchConfig) => void;
  dequeue: (id: string) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      pack: null,
      config: blankConfig(),
      savedConfigs: [],
      pending: [],
      setPack: (pack) => set({ pack }),
      setConfig: (config) => set({ config }),
      patchConfig: (patch) => set((s) => ({ config: { ...s.config, ...patch } })),
      saveLocal: () => {
        const config = { ...get().config, updatedAt: Date.now() };
        set((s) => ({
          config,
          savedConfigs: [config, ...s.savedConfigs.filter((c) => c.id !== config.id)],
        }));
        return config;
      },
      enqueue: (config) =>
        set((s) => ({
          pending: [
            ...s.pending.filter((p) => p.config.id !== config.id),
            { id: `${config.id}:${config.updatedAt}`, config },
          ],
        })),
      dequeue: (id) => set((s) => ({ pending: s.pending.filter((p) => p.id !== id) })),
    }),
    { name: 'impro-library' },
  ),
);
