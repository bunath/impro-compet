import { Coffee, Pause, Play, Square } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { formatClock, remainingMs } from '@/lib/clock';
import { useMatchStore } from '@/store/matchStore';

export function HalftimePanel({ now }: { now: number }) {
  const m = useMatchStore();
  const h = m.live.halftime;
  const running = h.startedAt !== null;
  return (
    <Card
      title={
        <span className="inline-flex items-center gap-1.5">
          <Coffee size={12} /> Mi-temps
        </span>
      }
    >
      <div className="flex items-center gap-2">
        <span className="font-display text-3xl">{formatClock(remainingMs(h, now))}</span>
        <Button
          variant="primary"
          onClick={m.toggleHalftime}
          aria-label={running ? 'Pause mi-temps' : 'Lancer la mi-temps'}
        >
          {running ? <Pause size={14} /> : <Play size={14} />}
        </Button>
        <Button onClick={m.stopHalftime} aria-label="Arrêter la mi-temps">
          <Square size={13} />
        </Button>
        <label className="ml-auto flex items-center gap-1 text-[11px] text-muted">
          min
          <input
            type="number"
            min={1}
            max={60}
            value={Math.round(h.durationMs / 60000)}
            disabled={h.active}
            onChange={(e) => m.setHalftimeDuration(Math.max(1, Number(e.target.value)) * 60)}
            className="h-8 w-12 rounded-md border border-line bg-panel-2 px-1 text-center text-ink outline-none focus:border-accent"
          />
        </label>
      </div>
    </Card>
  );
}
