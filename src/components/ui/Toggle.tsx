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
      className="inline-flex items-center gap-2 text-sm"
    >
      <span
        className={`h-6 w-11 rounded-full p-0.5 transition ${checked ? 'bg-accent' : 'bg-line'}`}
      >
        <span
          className={`block h-5 w-5 rounded-full bg-white transition ${checked ? 'translate-x-5' : ''}`}
        />
      </span>
      {label}
    </button>
  );
}
