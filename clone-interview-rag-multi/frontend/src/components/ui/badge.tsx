import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium',
  {
    variants: {
      variant: {
        default: 'bg-white/5 text-[var(--color-stone-light)] border border-[var(--color-border)]',
        success: 'bg-[var(--color-success)] text-[var(--color-success-text)] border border-[var(--color-success-border)]',
        danger: 'bg-[var(--color-danger)] text-[var(--color-danger-text)] border border-[var(--color-danger-border)]',
        warning: 'bg-[var(--color-warning)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)]',
        accent: 'bg-[var(--color-accent-light)] text-[var(--color-accent)] border border-[var(--color-accent)]/20',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
