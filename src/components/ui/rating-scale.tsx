'use client';
import { cn } from '@/lib/utils';

interface RatingScaleProps {
  value: number;
  onChange: (value: number) => void;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
}

export function RatingScale({
  value,
  onChange,
  leftLabel = 'Poor',
  rightLabel = 'Excellent',
  className,
}: RatingScaleProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex justify-between items-center gap-2">
        {[1, 2, 3, 4, 5].map((number) => (
          <button
            key={number}
            type="button"
            onClick={() => onChange(number)}
            className={cn(
              'w-full h-12 rounded-lg text-sm font-medium transition-all',
              'hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              value === number
                ? 'bg-primary/15 text-primary border-2 border-primary'
                : 'bg-muted/50 text-muted-foreground border-2 border-transparent',
            )}
          >
            {number}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-sm text-muted-foreground px-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
