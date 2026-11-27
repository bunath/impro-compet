import { Download, ExternalLink, Settings2 } from 'lucide-react';
import { useEffect } from 'react';
import { CategoryList } from '@/components/console/CategoryList';
import { HalftimePanel } from '@/components/console/HalftimePanel';
import { MessagePanel } from '@/components/console/MessagePanel';
import { SpectatorPreview } from '@/components/console/SpectatorPreview';
import { TeamsPanel } from '@/components/console/TeamsPanel';
import { TimeControls } from '@/components/console/TimeControls';
import { Button, ServerBanner, Toggle } from '@/components/ui';
import { usePublishLive } from '@/hooks/useBusState';
import { useNow } from '@/hooks/useNow';
import { buildExport, exportFileName } from '@/lib/exportMatch';
import { saveJsonFile } from '@/services/files';
import { openSpectatorWindow } from '@/services/windows';
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
    void saveJsonFile(
      exportFileName(config),
      JSON.stringify(buildExport(config, useMatchStore.getState().live), null, 2),
    );

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-11 shrink-0 items-center gap-3 border-b border-line bg-panel px-3">
        <span className="text-[13px] font-semibold">{config.name}</span>
        <span className="h-4 w-px bg-line" />
        <Toggle
          checked={surprise}
          onChange={useMatchStore.getState().toggleSurprise}
          label={surprise ? 'Mode surprise : points masqués' : 'Mode surprise'}
        />
        <div className="ml-auto flex items-center gap-2">
          <ServerBanner />
          <Button size="sm" icon={<ExternalLink size={13} />} onClick={() => void openSpectatorWindow()}>
            Écran spectateur
          </Button>
          <Button size="sm" icon={<Download size={13} />} onClick={exportMatch}>
            Exporter
          </Button>
          <Button size="sm" icon={<Settings2 size={13} />} onClick={() => useAppStore.getState().go('setup')}>
            Préparation
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[18rem_1fr] grid-rows-[auto_1fr] gap-2.5 p-2.5">
        <HalftimePanel now={now} />
        <SpectatorPreview now={now} />

        <div className="flex min-h-0 flex-col gap-2.5">
          <TimeControls presets={config.timePresets} now={now} />
          <CategoryList categories={config.categories} allowNone={config.allowNoCategory} />
        </div>

        <div className="flex min-h-0 flex-col gap-2.5">
          <TeamsPanel />
          <MessagePanel presets={config.messagePresets} />
        </div>
      </div>
    </div>
  );
}
