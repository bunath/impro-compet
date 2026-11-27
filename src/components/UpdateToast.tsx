import { Download } from 'lucide-react';
import { Button, ProgressBar } from '@/components/ui';
import { installUpdate } from '@/services/updater';
import { useUpdateStore } from '@/store/updateStore';

export function UpdateToast() {
  const { status, version, progress } = useUpdateStore();
  if (status === 'idle') return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 rounded-2xl border border-line bg-panel p-4 shadow-2xl">
      {status === 'available' && (
        <>
          <p className="mb-3 text-sm">Mise à jour {version} disponible. À installer hors match.</p>
          <Button variant="primary" className="w-full" icon={<Download size={16} />} onClick={() => void installUpdate()}>Installer et redémarrer</Button>
        </>
      )}
      {status === 'downloading' && (<><p className="mb-2 text-sm">Téléchargement…</p><ProgressBar value={progress} /></>)}
      {status === 'ready' && <p className="text-sm">Redémarrage…</p>}
      {status === 'error' && <p className="text-sm text-danger">Échec de la mise à jour, réessaie plus tard.</p>}
    </div>
  );
}
