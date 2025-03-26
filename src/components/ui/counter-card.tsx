'use client';

import { Minus, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RatingScale } from '@/components/ui/rating-scale';
import { cn } from '@/lib/utils';

import FloatingShapes from './floating-shapes';

interface CounterCardProps {
  title: string;
  description?: string;
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  className?: string;
  // Rating scale props
  showRating?: boolean;
  ratingQuestion?: string;
  ratingValue?: number;
  onRatingChange?: (value: number) => void;
  leftLabel?: string;
  rightLabel?: string;
}

export default function CounterCard({
  title,
  description,
  value,
  onChange,
  disabled = false,
  className = '',
  // Rating scale props
  showRating = false,
  ratingValue,
  onRatingChange,
  ratingQuestion,
  leftLabel = 'Poor',
  rightLabel = 'Excellent',
}: CounterCardProps) {
  const [localCount, setLocalCount] = useState(value || 0);
  const [localRating, setLocalRating] = useState(ratingValue || 0);

  // Update local state when controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      setLocalCount(value);
    }
  }, [value]);

  useEffect(() => {
    if (ratingValue !== undefined) {
      setLocalRating(ratingValue);
    }
  }, [ratingValue]);

  // Determine if component is controlled or uncontrolled
  const isCountControlled = value !== undefined;
  const count = isCountControlled ? value : localCount;

  const isRatingControlled = ratingValue !== undefined;
  const rating = isRatingControlled ? ratingValue : localRating;

  const handleCountChange = (newValue: number) => {
    // Don't allow negative values
    if (newValue < 0) return;

    // Update local state if uncontrolled
    if (!isCountControlled) {
      setLocalCount(newValue);
    }

    // Call onChange if provided
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleRatingChange = (newValue: number) => {
    // Update local state if uncontrolled
    if (!isRatingControlled) {
      setLocalRating(newValue);
    }

    // Call onRatingChange if provided
    if (onRatingChange) {
      onRatingChange(newValue);
    }
  };

  const increment = () => {
    handleCountChange(count + 1);
  };

  const decrement = () => {
    if (count > 0) {
      handleCountChange(count - 1);
    }
  };

  return (
    <Card
      className={cn(
        'bg-white rounded-2xl border-none relative transition-opacity',
        disabled ? 'opacity-100' : 'opacity-100',
        className,
      )}
    >
      {disabled && (
        <FloatingShapes
          colors={['bg-emerald-200', 'bg-teal-200', 'bg-violet-200']}
          className="absolute inset-0 z-0 pointer-events-none"
        />
      )}
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={decrement}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Decrease count"
            disabled={disabled}
          >
            <Minus className="h-5 w-5" />
          </button>
          <span className="text-2xl font-medium text-slate-800 min-w-[2ch] text-center">
            {count}
          </span>
          <button
            onClick={increment}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Increase count"
            disabled={disabled}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {showRating && (
          <div className="space-y-3 border-t pt-4">
            <label className="text-sm font-medium">{ratingQuestion}</label>
            <RatingScale
              value={rating}
              onChange={handleRatingChange}
              leftLabel={leftLabel}
              rightLabel={rightLabel}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
