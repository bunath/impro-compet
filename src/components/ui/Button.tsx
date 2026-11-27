import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink hover:brightness-110 font-semibold',
  ghost: 'border border-line text-ink hover:bg-panel-2',
  subtle: 'bg-panel-2 text-ink hover:bg-line',
  danger: 'bg-danger/15 text-danger hover:bg-danger/25',
};
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-14 px-6 text-lg gap-2.5',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  active?: boolean;
  icon?: ReactNode;
}

export function Button({ variant = 'subtle', size = 'md', active, icon, className = '', children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center rounded-xl transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${active ? 'ring-2 ring-accent' : ''} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
