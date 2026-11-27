import type { InputHTMLAttributes } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  onChange: (value: string) => void;
}

export function Field({ label, onChange, className = '', ...rest }: Props) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-[11px] font-medium text-muted">{label}</span>}
      <input
        {...rest}
        onChange={(e) => onChange(e.target.value)}
        className={`h-8 w-full rounded-md border border-line bg-panel-2 px-2.5 text-[13px] outline-none transition placeholder:text-muted/60 focus:border-accent ${className}`}
      />
    </label>
  );
}
