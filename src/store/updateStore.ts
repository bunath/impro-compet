import { create } from 'zustand';

interface UpdateState {
  status: 'idle' | 'available' | 'downloading' | 'ready' | 'error';
  version: string | null;
  progress: number;
  set: (patch: Partial<Omit<UpdateState, 'set'>>) => void;
}

export const useUpdateStore = create<UpdateState>((set) => ({
  status: 'idle',
  version: null,
  progress: 0,
  set: (patch) => set(patch),
}));
