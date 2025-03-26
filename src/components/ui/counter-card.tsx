'use client';

import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Counter from '@/components/ui/counter';
import { cn } from '@/lib/utils';

import FloatingShapes from './floating-shapes';

interface CounterCardProps {
  title: string;
  description?: string;
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export default function CounterCard({
  title,
  description,
  value,
  onChange,
  disabled,
  className = '',
}: CounterCardProps) {
  const [localCount, setLocalCount] = useState(value || 0);

  // Update local state when controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      setLocalCount(value);
    }
  }, [value]);

  // Determine if component is controlled or uncontrolled
  const isCountControlled = value !== undefined;
  const count = isCountControlled ? value : localCount;

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

  return (
    <Card
      className={cn(
        'bg-white rounded-2xl border-none relative transition-opacity opacity-100',
        className,
      )}
    >
      {!disabled && (
        <FloatingShapes
          colors={['bg-emerald-200', 'bg-teal-200', 'bg-violet-200']}
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
          <Counter value={value ?? 0} onChange={onChange} disabled={disabled} />
        </div>
      </CardContent>
    </Card>
  );
}
