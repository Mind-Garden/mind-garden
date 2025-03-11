'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SickRatingProps {
  onChange: (value: number) => void;
}

export default function SickRating({ onChange }: SickRatingProps) {
  const [rating, setRating] = useState<number | null>(null);

  return (
    <Card className=" items-center justify-between py-2 px-3 bg-white/10 backdrop-blur-sm rounded-xl">
      <CardContent>
        <div className="grid grid-cols-5 gap-2 mt-5">
          {[1, 2, 3, 4, 5].map((value) => (
            <Button
              key={value}
              type="button"
              variant={rating === value ? 'default' : 'outline'}
              className={cn(
                'h-16 relative',
                rating === value && 'ring-2 ring-ring ring-offset-2',
                value === 1 && 'bg-green-100 hover:bg-green-200 text-green-800',
                value === 2 && 'bg-lime-100 hover:bg-lime-200 text-lime-800',
                value === 3 &&
                  'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
                value === 4 &&
                  'bg-orange-100 hover:bg-orange-200 text-orange-800',
                value === 5 && 'bg-red-100 hover:bg-red-200 text-red-800',
                rating === value &&
                  value === 1 &&
                  'bg-green-200 text-green-900',
                rating === value && value === 2 && 'bg-lime-200 text-lime-900',
                rating === value &&
                  value === 3 &&
                  'bg-yellow-200 text-yellow-900',
                rating === value &&
                  value === 4 &&
                  'bg-orange-200 text-orange-900',
                rating === value && value === 5 && 'bg-red-200 text-red-900',
              )}
              onClick={() => {
                setRating(value), onChange(value);
              }}
            >
              {value === 1}
              {value === 2}
              {value === 3}
              {value === 4}
              {value === 5}
              <span>{value}</span>
            </Button>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2 mb-1">
          <span className="text-xs">Healthy</span>
          <span className="text-xs">Very Sick</span>
        </div>
      </CardContent>
    </Card>
  );
}
