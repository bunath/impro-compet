import { Download, Eye, EyeOff, LogOut } from 'lucide-react';
import { useEffect } from 'react';
import { CategoryList } from '@/components/console/CategoryList';
import { HalftimePanel } from '@/components/console/HalftimePanel';
import { MessagePanel } from '@/components/console/MessagePanel';
import { SpectatorPreview } from '@/components/console/SpectatorPreview';
import { TeamsPanel } from '@/components/console/TeamsPanel';
import { TimeControls } from '@/components/console/TimeControls';
import { Button } from '@/components/ui';
import { useNow } from '@/hooks/useNow';
import { usePublishLive } from '@/hooks/useBusState';
import { buildExport, exportFileName } from '@/lib/exportMatch';
import { saveJsonFile } from '@/services/files';
import { useAppStore } from '@/store/appStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useMatchStore } from '@/store/matchStore';

/** Régie : tout est à portée de clic, aucune navigation pendant le match. */
export function ConsolePage() {
  const config = useLibraryStore((s) => s.config);
  const surprise = useMatchStore((s) => s.live.surprise);
  const now = useNow(200);
  usePublishLive();

  // Arrête automatiquement les chronos arrivés à zéro.
  useEffect(() => useMatchStore.getState().stopClocksIfElapsed(now), [now]);

  const exportMatch = () =>
    void saveJsonFile(exportFileName(config), JSON.stringify(buildExport(config, useMatchStore.getState().live), null, 2));

  return (
    <div className="grid h-full grid-cols-[20rem_1fr] grid-rows-[auto_1fr] gap-3 p-3">
      <HalftimePanel now={now} />
      <SpectatorPreview now={now} />

      <div className="flex min-h-0 flex-col gap-3">
        <TimeControls presets={config.timePresets} now={now} />
        <CategoryList categories={config.categories} allowNone={config.allowNoCategory} />
      </div>

      <div className="flex min-h-0 flex-col gap-3">
        <TeamsPanel />
        <MessagePanel presets={config.messagePresets} />
        <div className="flex items-center gap-2">
          <Button variant={surprise ? 'primary' : 'subtle'} icon={surprise ? <EyeOff size={16} /> : <Eye size={16} />} onClick={useMatchStore.getState().toggleSurprise}>
            Mode surprise {surprise ? 'ON — points masqués (?)' : 'OFF'}
          </Button>
          <Button className="ml-auto" icon={<Download size={16} />} onClick={exportMatch}>Exporter</Button>
          <Button variant="ghost" icon={<LogOut size={16} />} onClick={() => useAppStore.getState().go('setup')}>Préparation</Button>
        </div>
      </div>
    </div>
  );
}
