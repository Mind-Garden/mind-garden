'use client';

import { MinusCircle, PlusCircle } from 'lucide-react';

import { Button } from '@/components/shadcn/button';

interface QuantityTrackerProps {
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  question: string;
}

export default function QuantityTrackerSimple({
  value,
  min = 0,
  max = 100,
  disabled,
  onChange,
  question,
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
    <div className="flex items-center justify-between py-2 px-3 bg-white/5 backdrop-blur-sm rounded-xl">
      <span className="text-sm font-medium">{question}</span>

      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={decrement}
          disabled={disabled || value <= min}
          className={`h-10 w-10 rounded-full p-0
            ${
              disabled
                ? 'opacity-50 pointer-events-none shadow-none bg-transparent'
                : 'hover:bg-slate-100 hover:shadow' // This applies hover shadow only when not disabled
            }`}
        >
          <MinusCircle className="h-6 w-6" />
          <span className="sr-only">Decrease</span>
        </Button>

        <span className="text-m font-medium w-9 text-center">{value}</span>

        <Button
          variant="ghost"
          size="icon"
          onClick={increment}
          disabled={disabled || value >= max}
          className={`h-10 w-10 rounded-full p-0
            ${
              disabled
                ? 'opacity-50 pointer-events-none shadow-none bg-transparent'
                : 'hover:bg-slate-100 hover:shadow' // This applies hover shadow only when not disabled
            }`}
        >
          <PlusCircle className="h-6 w-6" />
          <span className="sr-only">Increase</span>
        </Button>
      </div>
    </div>
  );
}
