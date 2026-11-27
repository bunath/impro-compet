import { Card, Stepper } from '@/components/ui';
import type { TeamIndex } from '@/lib/match';
import { useMatchStore } from '@/store/matchStore';

function TeamColumn({ index }: { index: TeamIndex }) {
  const team = useMatchStore((s) => s.live.teams[index]);
  const m = useMatchStore();
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-line bg-panel-2 p-4">
      <span className="absolute inset-x-0 top-0 h-0.5 rounded-t-lg" style={{ background: team.color }} />
      <input
        value={team.name}
        onChange={(e) => m.setTeamName(index, e.target.value)}
        aria-label={`Nom équipe ${index + 1}`}
        className="w-full bg-transparent text-center text-xl font-bold outline-none focus:text-accent"
      />
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Points</div>
      <Stepper
        big
        label="Point"
        value={team.score}
        onInc={() => m.addPoint(index, 1)}
        onDec={() => m.addPoint(index, -1)}
      />
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted">Fautes</div>
      <Stepper
        label="Faute"
        value={team.fouls}
        onInc={() => m.addFoul(index, 1)}
        onDec={() => m.addFoul(index, -1)}
      />
    </div>
  );
}

export function TeamsPanel() {
  return (
    <Card title="Équipes · 3 fautes = +1 point à l’adversaire" className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 gap-3">
        <TeamColumn index={0} />
        <TeamColumn index={1} />
      </div>
    </Card>
  );
}
