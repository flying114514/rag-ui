import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <motion.div
      className={cn('mb-16 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div>
        <p className="text-[9px] font-medium uppercase tracking-[0.4em] text-[var(--color-accent)] mb-3">
          {title.toUpperCase()}
        </p>
        <h1 className="text-editorial text-[clamp(36px,5vw,56px)] text-[var(--color-cream)] leading-[0.95]">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-[14px] leading-relaxed text-white/40 max-w-[500px]">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </motion.div>
  );
}
