import { Minus, Pause, Play, Plus, Timer } from 'lucide-react';
import { Button, Card, Toggle } from '@/components/ui';
import { formatClock, remainingMs } from '@/lib/clock';
import type { TimePreset } from '@/lib/types';
import { useMatchStore } from '@/store/matchStore';

export function TimeControls({ presets, now }: { presets: TimePreset[]; now: number }) {
  const m = useMatchStore();
  const { timer, timerEnabled } = m.live;
  const running = timer.startedAt !== null;
  return (
    <Card title="Temps" action={<Toggle checked={timerEnabled} onChange={m.toggleTimerEnabled} />}>
      <div className={`space-y-3 ${timerEnabled ? '' : 'pointer-events-none opacity-40'}`}>
        <div className="text-center font-display text-6xl tabular-nums">
          {formatClock(remainingMs(timer, now))}
        </div>
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          icon={running ? <Pause size={20} /> : <Play size={20} />}
          onClick={m.toggleTimerRun}
        >
          {running ? 'Pause' : 'Play'}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button icon={<Minus size={14} />} onClick={() => m.addTime(-10)}>
            10 s
          </Button>
          <Button icon={<Plus size={14} />} onClick={() => m.addTime(10)}>
            10 s
          </Button>
        </div>
        {presets.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <Button
                key={p.id}
                size="sm"
                icon={<Timer size={12} />}
                onClick={() => m.setTimer(p.seconds)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
