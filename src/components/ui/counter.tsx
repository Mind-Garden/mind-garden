'use client';

import { AnimatePresence, motion } from 'framer-motion';
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
      <motion.button
        onClick={decrement}
        whileTap={{ scale: 0.9 }}
        disabled={disabled}
        className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300 text-slate-600 hover:bg-slate-100 hover:shadow disabled:opacity-50"
        aria-label="Decrease count"
      >
        <Minus className="h-5 w-5" />
      </motion.button>

      {/* Rolling Number Animation */}
      <div className="relative w-10 h-10 overflow-hidden flex justify-center items-center">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={count}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute text-2xl font-medium text-slate-800"
          >
            {count}
          </motion.span>
        </AnimatePresence>
      </div>

      <motion.button
        onClick={increment}
        whileTap={{ scale: 0.9 }}
        disabled={disabled}
        className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300 text-slate-600 hover:bg-slate-100 hover:shadow disabled:opacity-50"
        aria-label="Increase count"
      >
        <Plus className="h-5 w-5" />
      </motion.button>
    </div>
  );
}
