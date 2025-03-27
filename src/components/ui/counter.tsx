'use client';

import { Minus, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CounterProps {
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

export default function Counter({ value, onChange, disabled }: CounterProps) {
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

  const increment = () => {
    handleCountChange(count + 1);
  };

  const decrement = () => {
    if (count > 0) {
      handleCountChange(count - 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={decrement}
        className={`
    w-10 h-10 rounded-full flex items-center justify-center 
    border border-slate-300 text-slate-600 transition-colors
    ${
      disabled
        ? 'opacity-50 pointer-events-none shadow-none bg-transparent'
        : 'hover:bg-slate-100 hover:shadow' // This applies hover shadow only when not disabled
    }
  `}
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
        className={`w-10 h-10 rounded-full flex items-center justify-center border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors
          ${
            disabled
              ? 'opacity-50 pointer-events-none shadow-none bg-transparent'
              : 'hover:bg-slate-100 hover:shadow' // This applies hover shadow only when not disabled
          }`}
        aria-label="Increase count"
        disabled={disabled}
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}
