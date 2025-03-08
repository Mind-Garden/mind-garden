'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YesNoFormProps {
  question: string;
  initialValue?: boolean | null;
  // onSubmit?: (value: boolean) => Promise<void>
  disabled?: boolean;
  submitLabel?: string;
}

export default function YesNoForm({
  question,
  initialValue = null,
  // onSubmit,
  disabled = false,
  submitLabel = 'Save',
}: YesNoFormProps) {
  const [selected, setSelected] = useState<boolean | null>(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    // if (selected === null || !onSubmit) return
    // setSubmitting(true)
    // try {
    //   // await onSubmit(selected)
    // } catch (error) {
    //   console.error("Error submitting response:", error)
    // } finally {
    //   setSubmitting(false)
    // }
  };

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-white/50 backdrop-blur-sm rounded-xl">
      <span className="text-sm font-medium">{question}</span>

      <div className="flex items-center gap-5 ml-3">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'flex items-center h-6 w-10 rounded-md transition-all bg-transparent px-1',
            selected === true ? 'bg-green-50 text-green-700' : '',
          )}
          onClick={() => handleSubmit()}
          disabled={disabled || submitting}
        >
          <CheckCircle2 className="h-3 w-3 text-black-500 mr-1" />
          <span className="text-xs">Yes</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'flex items-center h-6 w-10 rounded-md transition-all bg-transparent px-1',
            selected === false ? 'bg-red-50 text-red-700' : '',
          )}
          onClick={() => handleSubmit()}
          disabled={disabled || submitting}
        >
          <XCircle className="h-3 w-3 text-black-500 mr-1" />
          <span className="text-xs">No</span>
        </Button>
      </div>
    </div>
  );
}
