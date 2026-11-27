import type { ReactNode } from 'react';

export function Tile({
  icon,
  title,
  hint,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-start gap-3 rounded-2xl border border-line bg-panel p-5 text-left transition hover:-translate-y-1 hover:border-accent hover:bg-panel-2 active:scale-95"
    >
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent transition group-hover:bg-accent group-hover:text-accent-ink">
        {icon}
      </span>
      <span className="font-semibold">{title}</span>
      <span className="text-sm text-muted">{hint}</span>
    </button>
  );
}
