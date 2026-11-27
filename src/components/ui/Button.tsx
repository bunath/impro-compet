import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink font-semibold hover:brightness-110',
  ghost: 'border border-line text-ink hover:bg-panel-2',
  subtle: 'bg-panel-2 text-ink border border-line hover:border-muted/50',
  danger: 'bg-danger/10 text-danger hover:bg-danger/20',
};
const sizes: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1.5',
  md: 'h-8 px-3 text-[13px] gap-2',
  lg: 'h-9 px-4 text-sm gap-2',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  active?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = 'subtle',
  size = 'md',
  active,
  icon,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center rounded-md font-medium transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${active ? '!border-accent !bg-accent/10 !text-accent' : ''} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
