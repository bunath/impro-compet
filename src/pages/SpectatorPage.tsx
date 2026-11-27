import { ScaledStage } from '@/components/spectator/ScaledStage';
import { SpectatorScreen } from '@/components/spectator/SpectatorScreen';
import { useNow } from '@/hooks/useNow';
import { useSpectatorState } from '@/hooks/useBusState';
import { toggleFullscreen } from '@/services/windows';

/** Fenêtre du 2ᵉ écran. Double-clic ou F11 : plein écran. Aucun contrôle visible. */
export function SpectatorPage() {
  const live = useSpectatorState();
  const now = useNow(100);
  return (
    <div
      className="h-full w-full cursor-none"
      onDoubleClick={() => void toggleFullscreen()}
      onKeyDown={(e) => e.key === 'F11' && void toggleFullscreen()}
      tabIndex={0}
    >
      <ScaledStage>
        {live ? (
          <SpectatorScreen live={live} now={now} />
        ) : (
          <div className="grid h-full place-items-center text-4xl font-semibold uppercase tracking-[0.3em] text-white/30">
            En attente de la régie…
          </div>
        )}
      </ScaledStage>
    </div>
  );
}
