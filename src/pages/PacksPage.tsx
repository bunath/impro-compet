import { useEffect, useState } from 'react';
import { Button, Card, ProgressBar, ServerBanner } from '@/components/ui';
import { BASE_PACK, configFromPack } from '@/lib/basePack';
import { api, downloadPack, type PackSummary } from '@/services/api';
import { useAppStore } from '@/store/appStore';
import { useLibraryStore } from '@/store/libraryStore';

export function PacksPage() {
  const [packs, setPacks] = useState<PackSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ id: string; ratio: number } | null>(null);

  useEffect(() => {
    api.listPacks().then(setPacks).catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  const pick = async (id: string) => {
    try {
      const pack = await downloadPack(id, (ratio) => setProgress({ id, ratio }));
      useLibraryStore.getState().setPack(pack);
      useLibraryStore.getState().setConfig(configFromPack(pack));
      useAppStore.getState().go('setup');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setProgress(null);
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col justify-center gap-4 p-8">
      <h1 className="font-display text-5xl uppercase tracking-widest">Packs de ressources</h1>
      <ServerBanner />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="space-y-3">
        {(packs ?? []).map((p) => (
          <Card key={p.id}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{p.name} <span className="text-xs text-muted">v{p.version}</span></p>
                <p className="text-sm text-muted">{p.description}</p>
              </div>
              <Button variant="primary" disabled={progress !== null} onClick={() => void pick(p.id)}>Choisir</Button>
            </div>
            {progress?.id === p.id && <div className="mt-3"><ProgressBar value={progress.ratio} /></div>}
          </Card>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => useAppStore.getState().go('welcome')}>← Retour</Button>
        {error && (
          <Button onClick={() => { useLibraryStore.getState().setConfig(configFromPack(BASE_PACK)); useAppStore.getState().go('setup'); }}>
            Utiliser le pack intégré
          </Button>
        )}
      </div>
    </div>
  );
}
