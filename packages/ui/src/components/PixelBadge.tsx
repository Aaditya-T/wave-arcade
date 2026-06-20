import type { HTMLAttributes, ReactNode } from 'react';

export type PixelBadgeVariant = 'faction' | 'quest' | 'wallet';

const variantClasses: Record<PixelBadgeVariant, string> = {
  faction: 'border-arcade-secondary text-arcade-secondary',
  quest: 'border-arcade-success text-arcade-success',
  wallet: 'border-arcade-primary text-arcade-primary',
};

export interface PixelBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: PixelBadgeVariant;
  children: ReactNode;
}

export function PixelBadge({ variant = 'faction', children, className = '', ...props }: PixelBadgeProps) {
  return (
    <span
      className={`inline-block border-2 px-2 py-0.5 font-pixel text-[8px] uppercase ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
