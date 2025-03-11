'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YesNoFormProps {
  question: string;
  initialValue?: boolean | null;
  disabled?: boolean;
  onChange: (value: boolean | null) => void;
}

export default function YesNoForm({
  question,
  initialValue,
  onChange,
  disabled = false,
}: YesNoFormProps) {
  const [selected, setSelected] = useState<boolean | null>(
    initialValue ?? null,
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (select: boolean | null) => {
    onChange(select ?? null);
    setSelected(select ?? null);
  };

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-white/5 backdrop-blur-sm rounded-xl">
      <span className="text-sm font-medium">{question}</span>

      <div className="flex items-center gap-3 ml-3">
        {selected == true ? (
          <span className="text-s mr-1">Yes</span>
        ) : selected == false ? (
          <span className="text-s mr-1">No</span>
        ) : (
          <span className="text-m"></span>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'flex items-center rounded-md transition-all bg-transparent px-1',
            selected === true ? 'text-green-700' : '',
          )}
          onClick={() => handleSubmit(true)}
          disabled={disabled || submitting}
        >
          <CheckCircle2 className="h-3 w-3 text-black-500 mr-1" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'flex items-center rounded-md transition-all bg-transparent px-1',
            selected === false ? 'text-red-700' : '',
          )}
          onClick={() => handleSubmit(false)}
          disabled={disabled || submitting}
        >
          <XCircle className="h-3 w-3 text-black-500 mr-1" />
        </Button>
      </div>
    </div>
  );
}
