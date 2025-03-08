'use client';

import { Button } from '@/components/ui/button';
import { MinusCircle, PlusCircle } from 'lucide-react';

interface QuantityTrackerProps {
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export default function QuantityTrackerSimple({
  value,
  min = 0,
  max = 100,
  disabled = false,
  onChange,
}: QuantityTrackerProps) {
  // Handle increment
  const increment = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  // Handle decrement
  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={decrement}
          disabled={disabled || value <= min}
          className="h-10 w-10 rounded-full p-0"
        >
          <MinusCircle className="h-6 w-6" />
          <span className="sr-only">Decrease</span>
        </Button>

        <span className="text-2xl font-medium w-8 text-center">{value}</span>

        <Button
          variant="ghost"
          size="icon"
          onClick={increment}
          disabled={disabled || value >= max}
          className="h-10 w-10 rounded-full p-0"
        >
          <PlusCircle className="h-6 w-6" />
          <span className="sr-only">Increase</span>
        </Button>
      </div>
    </div>
  );
}
