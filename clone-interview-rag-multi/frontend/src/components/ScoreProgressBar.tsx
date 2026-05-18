import {motion} from 'framer-motion';
import {calculatePercentage} from '../utils/score';

interface ScoreProgressBarProps {
  label: string;
  score: number;
  maxScore: number;
  color?: string;
  delay?: number;
  className?: string;
}

export default function ScoreProgressBar({
  label,
  score,
  maxScore,
  color = 'bg-[var(--color-accent)]',
  delay = 0,
  className = ''
}: ScoreProgressBarProps) {
  const percentage = calculatePercentage(score, maxScore);

  return (
    <div className={`rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3 ${className}`}>
      <div className="mb-1 text-xs font-medium text-white/60">{label}</div>
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-warm)]">
          <motion.div
            className={`h-full ${color} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, delay }}
          />
        </div>
        <span className="w-8 text-right text-sm font-semibold text-[var(--color-cream)]">
          {score}/{maxScore}
        </span>
      </div>
    </div>
  );
}
