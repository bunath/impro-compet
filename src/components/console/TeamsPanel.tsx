import { Card, Stepper } from '@/components/ui';
import type { TeamIndex } from '@/lib/match';
import { displayScore } from '@/lib/match';
import { useMatchStore } from '@/store/matchStore';

function TeamColumn({ index }: { index: TeamIndex }) {
  const team = useMatchStore((s) => s.live.teams[index]);
  const m = useMatchStore();
  return (
    <div className="flex flex-1 flex-col items-center gap-4 rounded-2xl bg-panel-2 p-4" style={{ borderTop: `4px solid ${team.color}` }}>
      <input
        value={team.name}
        onChange={(e) => m.setTeamName(index, e.target.value)}
        aria-label={`Nom équipe ${index + 1}`}
        className="w-full bg-transparent text-center font-display text-4xl uppercase tracking-wide outline-none focus:text-accent"
      />
      <div className="text-xs uppercase tracking-widest text-muted">Points</div>
      <Stepper big label="Point" value={displayScore(team.score, false)} onInc={() => m.addPoint(index, 1)} onDec={() => m.addPoint(index, -1)} />
      <div className="text-xs uppercase tracking-widest text-muted">Fautes</div>
      <Stepper label="Faute" value={team.fouls} onInc={() => m.addFoul(index, 1)} onDec={() => m.addFoul(index, -1)} />
    </div>
  );
}

export function TeamsPanel() {
  return (
    <Card title="Équipes — 3 fautes = +1 point à l’adversaire" className="flex-1">
      <div className="flex h-full gap-4">
        <TeamColumn index={0} />
        <TeamColumn index={1} />
      </div>
    </Card>
  );
}
