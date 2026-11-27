import { Minus, Plus } from 'lucide-react';

/** Compteur −/+ (points, fautes). */
export function Stepper({
  value,
  onInc,
  onDec,
  label,
  big,
}: {
  value: number | string;
  onInc: () => void;
  onDec: () => void;
  label: string;
  big?: boolean;
}) {
  const btn =
    'grid place-items-center rounded-md border border-line transition active:scale-90 h-9 w-9';
  return (
    <div className="flex items-center gap-3">
      <button aria-label={`${label} -1`} onClick={onDec} className={`${btn} bg-panel-2 hover:border-muted/50`}>
        <Minus size={16} />
      </button>
      <span className={`min-w-[2ch] text-center font-display ${big ? 'text-6xl' : 'text-2xl'}`}>{value}</span>
      <button
        aria-label={`${label} +1`}
        onClick={onInc}
        className={`${btn} border-transparent bg-accent text-accent-ink hover:brightness-110`}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
