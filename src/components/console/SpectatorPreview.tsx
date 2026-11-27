import { ExternalLink } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { ScaledStage } from '@/components/spectator/ScaledStage';
import { SpectatorScreen } from '@/components/spectator/SpectatorScreen';
import { useMatchStore } from '@/store/matchStore';
import { openSpectatorWindow } from '@/services/windows';

export function SpectatorPreview({ now }: { now: number }) {
  const live = useMatchStore((s) => s.live);
  return (
    <Card title="Aperçu écran spectateur (live)" action={<Button size="sm" icon={<ExternalLink size={14} />} onClick={() => void openSpectatorWindow()}>Ouvrir l’écran</Button>} className="min-w-0">
      <div className="mx-auto aspect-video max-h-[240px] overflow-hidden rounded-xl border border-line">
        <ScaledStage><SpectatorScreen live={live} now={now} /></ScaledStage>
      </div>
    </Card>
  );
}
