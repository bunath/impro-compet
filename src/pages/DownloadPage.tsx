import { useEffect, useState } from 'react';
import { ProgressBar } from '@/components/ui';
import { BASE_PACK } from '@/lib/basePack';
import { logger } from '@/lib/logger';
import { downloadPack } from '@/services/api';
import { useAppStore } from '@/store/appStore';
import { useLibraryStore } from '@/store/libraryStore';

/** Premier lancement uniquement : télécharge le pack de base (repli sur le pack embarqué). */
export function DownloadPage() {
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      let message: string | null = null;
      try {
        useLibraryStore.getState().setPack(await downloadPack('base', (r) => alive && setProgress(r)));
      } catch (e) {
        logger.warn('first-run', 'pack serveur indisponible, pack embarqué utilisé', String(e));
        useLibraryStore.getState().setPack(BASE_PACK);
        message = 'Serveur indisponible : pack intégré installé. Mise à jour automatique plus tard.';
        setProgress(1);
      }
      if (!alive) return;
      setNotice(message);
      await new Promise((r) => setTimeout(r, message ? 2200 : 700));
      useAppStore.getState().completeFirstRun();
      useAppStore.getState().go('welcome');
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="grid h-full place-items-center">
      <div className="w-[420px] space-y-4 text-center">
        <p className="text-lg font-semibold">Téléchargement du pack de ressources</p>
        <ProgressBar value={progress} />
        <p className="h-5 text-sm text-muted">{notice ?? `${Math.round(progress * 100)} %`}</p>
      </div>
    </div>
  );
}
