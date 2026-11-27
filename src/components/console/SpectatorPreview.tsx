import { Card } from '@/components/ui';
import { ScaledStage } from '@/components/spectator/ScaledStage';
import { SpectatorScreen } from '@/components/spectator/SpectatorScreen';
import { useMatchStore } from '@/store/matchStore';

export function SpectatorPreview({ now }: { now: number }) {
  const live = useMatchStore((s) => s.live);
  return (
    <Card title="Aperçu écran spectateur · live" className="min-w-0">
      <div className="mx-auto aspect-video max-h-[190px] overflow-hidden rounded-md border border-line">
        <ScaledStage>
          <SpectatorScreen live={live} now={now} />
        </ScaledStage>
      </div>
    </Card>
  );
}
