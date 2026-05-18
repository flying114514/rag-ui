import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-12 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] px-4 text-[14px] text-[var(--color-cream)] placeholder:text-[var(--color-stone)] transition-all duration-300 ease-[var(--ease-out)] hover:border-[var(--color-accent)]/30 focus:border-[var(--color-accent)] focus:shadow-[var(--shadow-glow)] focus:bg-[var(--color-surface-warm)]',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] px-4 py-3 text-[14px] leading-relaxed text-[var(--color-cream)] placeholder:text-[var(--color-stone)] transition-all duration-300 ease-[var(--ease-out)] hover:border-[var(--color-accent)]/30 focus:border-[var(--color-accent)] focus:shadow-[var(--shadow-glow)] focus:bg-[var(--color-surface-warm)]',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';
