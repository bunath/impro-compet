import { logger } from '@/lib/logger';
import { isServerOpen } from '@/lib/serverHours';
import { useAppStore } from '@/store/appStore';
import { useLibraryStore } from '@/store/libraryStore';
import { api } from './api';

/** Enregistre en local ; si connecté, envoie au serveur (ou met en file d'attente hors horaires). */
export async function saveConfig(): Promise<'local' | 'server' | 'queued'> {
  const lib = useLibraryStore.getState();
  const config = lib.saveLocal();
  if (!useAppStore.getState().user) return 'local';
  lib.enqueue(config);
  await flushPending();
  return useLibraryStore.getState().pending.length ? 'queued' : 'server';
}

let flushing = false;
export async function flushPending(): Promise<void> {
  if (flushing || !useAppStore.getState().user || !isServerOpen()) return;
  flushing = true;
  try {
    for (const op of useLibraryStore.getState().pending) {
      await api.putConfig(op.config);
      useLibraryStore.getState().dequeue(op.id);
      logger.info('sync', `config ${op.config.id} synchronisée`);
    }
  } catch (e) {
    logger.warn('sync', 'synchronisation reportée', String(e));
  } finally {
    flushing = false;
  }
}

/** Synchronisation automatique dès que le serveur redevient disponible. */
export function startSyncLoop(): () => void {
  const tick = () => void flushPending();
  const id = window.setInterval(tick, 30_000);
  window.addEventListener('online', tick);
  tick();
  return () => {
    window.clearInterval(id);
    window.removeEventListener('online', tick);
  };
}
