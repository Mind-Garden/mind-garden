'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
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
  disabled = false,
}: YesNoFormProps) {
  const [selected, setSelected] = useState<boolean | null>(initialValue);

  const handleSelection = (value: boolean | null) => {
    setSelected(value);
    onChange(value);
  };

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-white/5 backdrop-blur-sm rounded-xl">
      <span className="text-sm font-medium">{question}</span>

      <div className="flex items-center gap-3 ml-3">
        <span className="text-sm mr-1">
          {selected !== null ? (selected ? 'Yes' : 'No') : ''}
        </span>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'flex items-center rounded-md transition-all px-1',
            selected === true ? 'text-green-700' : 'text-gray-500',
          )}
          onClick={() => handleSelection(true)}
          disabled={disabled}
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'flex items-center rounded-md transition-all px-1',
            selected === false ? 'text-red-700' : 'text-gray-500',
          )}
          onClick={() => handleSelection(false)}
          disabled={disabled}
        >
          <XCircle className="h-3 w-3 mr-1" />
        </Button>
      </div>
    </div>
  );
}
