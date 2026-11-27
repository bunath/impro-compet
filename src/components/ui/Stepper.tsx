import { Minus, Plus } from 'lucide-react';

/** Compteur −/+ gros boutons (points, fautes). */
export function Stepper({ value, onInc, onDec, label, big }: { value: number | string; onInc: () => void; onDec: () => void; label: string; big?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <button aria-label={`${label} -1`} onClick={onDec} className="grid h-12 w-12 place-items-center rounded-xl bg-panel-2 transition hover:bg-line active:scale-90">
        <Minus size={20} />
      </button>
      <span className={`min-w-[2.5ch] text-center font-display tabular-nums ${big ? 'text-6xl' : 'text-3xl'}`}>{value}</span>
      <button aria-label={`${label} +1`} onClick={onInc} className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-accent-ink transition hover:brightness-110 active:scale-90">
        <Plus size={20} />
      </button>
    </div>
  );
}
