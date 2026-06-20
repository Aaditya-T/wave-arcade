import type { HTMLAttributes, ReactNode } from 'react';

export interface ArcadePanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function ArcadePanel({ children, className = '', ...props }: ArcadePanelProps) {
  return (
    <div className={`arcade-panel bg-arcade-surface text-arcade-text-primary ${className}`} {...props}>
      {children}
    </div>
  );
}
