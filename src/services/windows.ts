import { logger } from '@/lib/logger';
import { isTauri } from '@/lib/tauri';

const LABEL = 'spectator';

export async function openSpectatorWindow(): Promise<void> {
  if (!isTauri()) {
    window.open('/?view=spectator', LABEL, 'width=1280,height=720');
    return;
  }
  const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
  const existing = await WebviewWindow.getByLabel(LABEL);
  if (existing) {
    await existing.setFocus();
    return;
  }
  const win = new WebviewWindow(LABEL, {
    url: 'index.html?view=spectator',
    title: 'Impro Régie — Écran spectateur',
    width: 1280,
    height: 720,
    backgroundColor: '#05060a',
  });
  void win.once('tauri://error', (e) => logger.error('window', 'ouverture spectateur échouée', e.payload));
}

export async function toggleFullscreen(): Promise<void> {
  if (isTauri()) {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    const w = getCurrentWindow();
    await w.setFullscreen(!(await w.isFullscreen()));
  } else if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else {
    await document.documentElement.requestFullscreen();
  }
}
