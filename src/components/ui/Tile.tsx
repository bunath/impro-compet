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
      className="group flex items-start gap-3 rounded-lg border border-line bg-panel p-3 text-left transition hover:border-accent/60 hover:bg-panel-2 active:scale-[0.98]"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-panel-2 text-muted transition group-hover:bg-accent/15 group-hover:text-accent [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>
      <span>
        <span className="block text-[13px] font-semibold">{title}</span>
        <span className="block text-xs text-muted">{hint}</span>
      </span>
    </button>
  );
}
