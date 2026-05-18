import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'transition-all duration-300 ease-[var(--ease-out)]',
  {
    variants: {
      variant: {
        default: 'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-card)] shadow-[var(--shadow-xs)]',
        interactive: 'rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-card)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[var(--color-accent)]/20 hover:-translate-y-1 cursor-pointer',
        elevated: 'rounded-[var(--radius-xl)] border border-[var(--color-border-strong)] bg-[var(--color-surface-card)] shadow-[var(--shadow-md)]',
        emphasis: 'rounded-[var(--radius-2xl)] border border-[var(--color-accent)]/20 bg-gradient-to-br from-[var(--color-surface-card)] to-[var(--color-surface-warm)] shadow-[var(--shadow-lg)]',
        glass: 'rounded-[var(--radius-xl)] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[var(--shadow-md)]',
        dark: 'rounded-[var(--radius-2xl)] bg-[var(--color-surface-raised)] border border-[var(--color-border)] shadow-[var(--shadow-xl)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant }), className)} {...props} />
  )
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-6 py-5', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-6', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';
