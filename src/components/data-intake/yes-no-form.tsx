'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/shadcn/button';
import { cn } from '@/lib/utils';

interface YesNoFormProps {
  question: string;
  initialValue?: boolean | null;
  disabled?: boolean;
  onChange: (value: boolean | null) => void;
}

export default function YesNoForm({
  question,
  initialValue = null,
  onChange,
  disabled,
}: YesNoFormProps) {
  const [selected, setSelected] = useState(initialValue);

  const handleSelection = (value: boolean) => {
    if (selected !== value) {
      setSelected(value);
      onChange(value);
    }
  };

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-white/5 backdrop-blur-sm rounded-xl">
      <span className="text-sm font-medium">{question}</span>

      <div className="flex items-center gap-3">
        {selected !== null && (
          <span className="text-sm font-bold text-gray-700">
            {selected ? 'Yes' : 'No'}
          </span>
        )}

        {[
          {
            value: true,
            icon: CheckCircle2,
            color: 'text-green-700',
            hover: 'hover:text-green-700',
          },
          {
            value: false,
            icon: XCircle,
            color: 'text-red-700',
            hover: 'hover:text-red-700',
          },
        ].map(({ value, icon: Icon, color, hover }) => (
          <Button
            key={String(value)}
            variant="ghost"
            size="sm"
            aria-label={value ? 'Yes' : 'No'}
            className={cn(
              'flex items-center h-6 w-6 rounded-full transition-all px-1',
              selected === value ? `${color}` : 'text-gray-500',
              disabled ? 'opacity-50 pointer-events-none' : hover,
            )}
            onClick={() => handleSelection(value)}
            disabled={disabled}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
    </div>
  );
}
