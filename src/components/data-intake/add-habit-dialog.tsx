'use client';

import { useState } from 'react';

import { Button } from '@/components/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/dialog';
import { Label } from '@/components/shadcn/label';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/select';
import { capitalizeWords } from '@/lib/utils';
import type { IPersonalizedCategories } from '@/supabase/schema';

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Array<IPersonalizedCategories>;
  onAddHabit: (
    categoryId: string,
    trackingMethod: 'boolean' | 'scale' | 'breakfast' | 'lunch' | 'dinner',
  ) => void;
}

const trackingOptions: Record<string, { value: string; label: string }[]> = {
  smoking: [
    { value: 'boolean', label: 'Did you smoke today?' },
    { value: 'scale', label: 'How many cigarettes did you have?' },
  ],
  alcohol: [
    { value: 'boolean', label: 'Did you drink today?' },
    { value: 'scale', label: 'How many drinks did you have?' },
  ],
  sick: [
    { value: 'boolean', label: 'Were you sick today?' },
    { value: 'scale', label: 'How sick did you feel today?' },
  ],
  meal: [
    { value: 'breakfast', label: 'Did you eat breakfast?' },
    { value: 'lunch', label: 'Did you eat lunch?' },
    { value: 'dinner', label: 'Did you eat dinner?' },
    { value: 'scale', label: 'How many meals did you have today?' },
  ],
  cooking: [
    { value: 'breakfast', label: 'Did you make breakfast?' },
    { value: 'lunch', label: 'Did you make lunch?' },
    { value: 'dinner', label: 'Did you make dinner?' },
    { value: 'scale', label: 'How many meals did you cook today?' },
  ],
};

export default function AddHabitDialog({
  open,
  onOpenChange,
  categories,
  onAddHabit,
}: AddHabitDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [trackingMethod, setTrackingMethod] = useState<
    'boolean' | 'scale' | 'breakfast' | 'lunch' | 'dinner'
  >('boolean');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }

    onAddHabit(selectedCategory, trackingMethod);
    onOpenChange(false);
    setSelectedCategory('');
    setTrackingMethod('boolean');
    setError('');
  };

  const selectedCategoryName =
    categories.find((category) => category.id === selectedCategory)?.name || '';
  const options = trackingOptions[selectedCategoryName] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-title text-xl">
            Add New Habit
          </DialogTitle>
          <DialogDescription className="font-body">
            Create a new habit to track in your daily form.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label
              className="font-header font-semibold text-md"
              htmlFor="category"
            >
              Category
            </Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger id="category">
                <SelectValue
                  className="font-body"
                  placeholder="Select a category"
                />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem
                    className="font-body"
                    key={category.id}
                    value={category.id}
                  >
                    {capitalizeWords(category.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedCategory && (
            <div className="grid gap-2">
              <Label className="font-body">Tracking Method</Label>
              <RadioGroup
                value={trackingMethod}
                onValueChange={(value) =>
                  setTrackingMethod(value as typeof trackingMethod)
                }
                className="flex flex-col space-y-1"
              >
                {options.length > 0 ? (
                  options.map(({ value, label }) => (
                    <div key={value} className="flex items-center">
                      <RadioGroupItem
                        className="border-primary text-primary-foreground data-[state=checked]:bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 data-[state=checked]:border-white"
                        value={value}
                        id={`tracking-${value}`}
                      />
                      <Label
                        className="ml-1 font-body"
                        htmlFor={`tracking-${value}`}
                      >
                        {label}
                      </Label>
                    </div>
                  ))
                ) : (
                  <Label className="font-body">Please choose a category.</Label>
                )}
              </RadioGroup>
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-xl bg-transparent border-black-100/50 hover:bg-black/10"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            className={
              'rounded-xl bg-transparent border-black-100/50 hover:bg-gradient-to-r from-emerald-200 via-sky-200 to-violet-200'
            }
            onClick={handleSubmit}
          >
            Add Habit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
