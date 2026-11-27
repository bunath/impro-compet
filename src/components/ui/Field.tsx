import type { InputHTMLAttributes } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  onChange: (value: string) => void;
}

export function Field({ label, onChange, className = '', ...rest }: Props) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-xs font-medium text-muted">{label}</span>}
      <input
        {...rest}
        onChange={(e) => onChange(e.target.value)}
        className={`h-10 w-full rounded-xl border border-line bg-panel-2 px-3 text-sm outline-none transition focus:border-accent ${className}`}
      />
    </label>
  );
}
