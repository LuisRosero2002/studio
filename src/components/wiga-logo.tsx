import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function WigaLogo({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-2 font-headline", className)} {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        width={28}
        height={28}
        className="text-primary"
        aria-hidden="true"
      >
        <g fill="currentColor">
          <path d="M 20,30, 50,10, 80,30, 50,50 Z" />
          <path d="M 20,50, 50,30, 80,50, 50,70 Z" opacity="0.7" />
          <path d="M 20,70, 50,50, 80,70, 50,90 Z" opacity="0.4" />
        </g>
      </svg>
      <span className="text-lg font-semibold tracking-tight text-foreground">
        Wiga Centro de Ventas
      </span>
    </div>
  );
}
