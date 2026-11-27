import { CloudOff, CloudUpload } from 'lucide-react';
import { useServerStatus } from '@/hooks/useServerStatus';
import { SERVER_HOURS_LABEL } from '@/lib/serverHours';

export function ServerBanner() {
  const { open, pending } = useServerStatus();
  if (open && !pending) return null;
  return (
    <div className="flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-2 text-xs text-muted">
      {open ? (
        <CloudUpload size={14} className="shrink-0 text-ok" />
      ) : (
        <CloudOff size={14} className="shrink-0 text-accent" />
      )}
      {open
        ? `${pending} élément(s) en cours de synchronisation…`
        : `Serveur hors horaires (ouvert de ${SERVER_HOURS_LABEL}) — mode hors-ligne${pending ? `, ${pending} en attente` : ''}. Synchronisation automatique à la réouverture.`}
    </div>
  );
}
