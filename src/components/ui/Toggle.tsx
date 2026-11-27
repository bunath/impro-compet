export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-xs text-muted hover:text-ink"
    >
      <span
        className={`h-4 w-7 rounded-full p-0.5 transition ${checked ? 'bg-accent' : 'bg-line'}`}
      >
        <span
          className={`block h-3 w-3 rounded-full bg-white transition ${checked ? 'translate-x-3' : ''}`}
        />
      </span>
      {label}
    </button>
  );
}
