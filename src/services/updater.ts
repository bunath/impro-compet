import { logger } from '@/lib/logger';
import { isTauri } from '@/lib/tauri';
import { useUpdateStore } from '@/store/updateStore';

type PendingUpdate = Awaited<ReturnType<typeof import('@tauri-apps/plugin-updater').check>>;
let pending: PendingUpdate = null;

/** Vérifie au lancement. N'installe JAMAIS sans clic (pas de redémarrage en plein match). */
export async function checkForUpdates(): Promise<void> {
  if (!isTauri() || import.meta.env.DEV) return;
  try {
    const { check } = await import('@tauri-apps/plugin-updater');
    pending = await check();
    if (pending) {
      logger.info('updater', `mise à jour ${pending.version} disponible`);
      useUpdateStore.getState().set({ status: 'available', version: pending.version });
    }
  } catch (e) {
    logger.warn('updater', 'vérification impossible', String(e));
  }
}

export async function installUpdate(): Promise<void> {
  if (!pending) return;
  const ui = useUpdateStore.getState();
  ui.set({ status: 'downloading', progress: 0 });
  try {
    let total = 0;
    let done = 0;
    await pending.downloadAndInstall((e) => {
      if (e.event === 'Started') total = e.data.contentLength ?? 0;
      if (e.event === 'Progress') {
        done += e.data.chunkLength;
        if (total) ui.set({ progress: done / total });
      }
    });
    ui.set({ status: 'ready', progress: 1 });
    const { relaunch } = await import('@tauri-apps/plugin-process');
    await relaunch();
  } catch (e) {
    logger.error('updater', 'installation échouée', String(e));
    ui.set({ status: 'error' });
  }
}
