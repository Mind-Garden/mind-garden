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

  useEffect(() => {
    if (value !== undefined) {
      setLocalCount(value);
    }
  }, [value]);

  const isCountControlled = value !== undefined;
  const count = isCountControlled ? value : localCount;

  const handleCountChange = (newValue: number) => {
    if (newValue < 0) return;
    if (!isCountControlled) {
      setLocalCount(newValue);
    }
    if (onChange) {
      onChange(newValue);
    }
  };

  const increment = () => handleCountChange(count + 1);
  const decrement = () => {
    if (count > 0) handleCountChange(count - 1);
  };

  return (
    <div
      className={`flex items-center justify-center gap-4 transition-opacity ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <button
        onClick={decrement}
        className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300 text-slate-600 hover:bg-slate-100 hover:shadow"
        aria-label="Decrease count"
      >
        <Minus className="h-5 w-5" />
      </button>
      <span className="text-2xl font-medium text-slate-800 min-w-[2ch] text-center">
        {count}
      </span>
      <button
        onClick={increment}
        className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300 text-slate-600 hover:bg-slate-100 hover:shadow"
        aria-label="Increase count"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}
