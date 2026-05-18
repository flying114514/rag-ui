import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 ease-[var(--ease-out)] disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none relative overflow-hidden',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--color-accent)] text-[var(--color-ink)] rounded-full shadow-[var(--shadow-glow)] hover:brightness-110 hover:shadow-[0_0_30px_rgba(200,149,108,0.3)] active:scale-[0.95]',
        secondary: 'bg-[var(--color-surface-card)] border border-[var(--color-border-strong)] text-[var(--color-cream)] rounded-full hover:bg-[var(--color-surface-warm)] hover:border-[var(--color-accent)]/30 active:scale-[0.97]',
        ghost: 'text-[var(--color-stone-light)] rounded-full hover:text-[var(--color-cream)] hover:bg-white/5 active:scale-[0.97]',
        danger: 'bg-[var(--color-danger)] border border-[var(--color-danger-border)] text-[var(--color-danger-text)] rounded-full hover:brightness-120 active:scale-[0.97]',
        accent: 'bg-gradient-to-r from-[#c8956c] via-[#daa87c] to-[#c8956c] bg-[length:200%_100%] text-[var(--color-ink)] rounded-full shadow-[0_4px_24px_rgba(200,149,108,0.35)] hover:shadow-[0_8px_40px_rgba(200,149,108,0.45)] hover:bg-[position:100%_0] active:scale-[0.95] font-semibold',
        dark: 'bg-white text-[var(--color-ink)] rounded-full shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] active:scale-[0.95] font-semibold',
        outline: 'border border-[var(--color-cream)]/30 text-[var(--color-cream)] rounded-full hover:bg-[var(--color-cream)]/5 hover:border-[var(--color-cream)]/60 active:scale-[0.97]',
      },
      size: {
        sm: 'h-8 px-4 text-[12px]',
        md: 'h-10 px-5 text-[13px]',
        lg: 'h-12 px-7 text-[14px]',
        xl: 'h-14 px-10 text-[15px] tracking-wide',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = 'Button';
export { buttonVariants };
