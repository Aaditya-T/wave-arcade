import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ArcadeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: ReactNode;
}

export function ArcadeButton({ loading, children, disabled, className = '', ...props }: ArcadeButtonProps) {
  return (
    <button
      className={`pixel-btn font-pixel text-xs uppercase tracking-wide disabled:opacity-50 ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? '...' : children}
    </button>
  );
}
