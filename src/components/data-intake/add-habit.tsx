'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
    // Validate inputs

    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }

    // Call the onAddHabit function with the form data
    onAddHabit(selectedCategory, trackingMethod);

    // Reset form
    onOpenChange(false);
    setSelectedCategory('');
    setTrackingMethod('boolean');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
          <DialogDescription>
            Create a new habit to track in your daily form.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedCategory ? (
            <div className="grid gap-2">
              <Label>Tracking Method</Label>
              <RadioGroup
                value={trackingMethod}
                onValueChange={(value) =>
                  setTrackingMethod(
                    value as
                      | 'boolean'
                      | 'scale'
                      | 'breakfast'
                      | 'lunch'
                      | 'dinner',
                  )
                }
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  {categories.find(
                    (category) =>
                      category.id === selectedCategory &&
                      category.name === 'smoking',
                  ) ? (
                    <div>
                      <div className="mb-1">
                        <RadioGroupItem value="boolean" id="tracking-boolean" />
                        <Label className="ml-1" htmlFor="tracking-boolean">
                          Did you smoke today?
                        </Label>
                      </div>
                      <RadioGroupItem value="scale" id="tracking-scale" />
                      <Label className="ml-1" htmlFor="tracking-scale">
                        How many cigarettes did you have?
                      </Label>
                    </div>
                  ) : categories.find(
                      (category) =>
                        category.id === selectedCategory &&
                        category.name === 'alcohol',
                    ) ? (
                    <div>
                      <div className="mb-1">
                        <RadioGroupItem value="boolean" id="tracking-boolean" />
                        <Label className="ml-1" htmlFor="tracking-boolean">
                          Did you drink today?
                        </Label>
                      </div>
                      <RadioGroupItem value="scale" id="tracking-scale" />
                      <Label className="ml-1" htmlFor="tracking-scale">
                        How many drinks did you have?
                      </Label>
                    </div>
                  ) : categories.find(
                      (category) =>
                        category.id === selectedCategory &&
                        category.name === 'sick',
                    ) ? (
                    <div>
                      <div className="mb-1">
                        <RadioGroupItem value="boolean" id="tracking-boolean" />
                        <Label className="ml-1" htmlFor="tracking-boolean">
                          Were you sick today?
                        </Label>
                      </div>
                      <RadioGroupItem value="scale" id="tracking-scale" />
                      <Label className="ml-1" htmlFor="tracking-scale">
                        How sick did you feel today?
                      </Label>
                    </div>
                  ) : categories.find(
                      (category) =>
                        category.id === selectedCategory &&
                        category.name === 'meal',
                    ) ? (
                    <div>
                      <div className="mb-1">
                        <RadioGroupItem
                          value="breakfast"
                          id="tracking-breakfast"
                        />
                        <Label className="ml-1" htmlFor="tracking-boolean">
                          Did you eat breakfast?
                        </Label>
                      </div>
                      <div className="mb-1">
                        <RadioGroupItem value="lunch" id="tracking-lunch" />
                        <Label className="ml-1" htmlFor="tracking-boolean">
                          Did you eat lunch?
                        </Label>
                      </div>
                      <div className="mb-1">
                        <RadioGroupItem value="dinner" id="tracking-dinner" />
                        <Label className="ml-1" htmlFor="tracking-boolean">
                          Did you eat dinner?
                        </Label>
                      </div>
                      <RadioGroupItem value="scale" id="tracking-scale" />
                      <Label className="ml-1" htmlFor="tracking-scale">
                        How many meals did you have today?
                      </Label>
                    </div>
                  ) : categories.find(
                      (category) =>
                        category.id === selectedCategory &&
                        category.name === 'cooking',
                    ) ? (
                    <div>
                      <div className="mb-1">
                        <RadioGroupItem
                          value="breakfast"
                          id="tracking-breakfast"
                        />
                        <Label className="ml-1" htmlFor="tracking-boolean">
                          Did you make breakfast?
                        </Label>
                      </div>
                      <div className="mb-1">
                        <RadioGroupItem value="lunch" id="tracking-lunch" />
                        <Label className="ml-1" htmlFor="tracking-boolean">
                          Did you make lunch?
                        </Label>
                      </div>
                      <div className="mb-1">
                        <RadioGroupItem value="dinner" id="tracking-dinner" />
                        <Label className="ml-1" htmlFor="tracking-boolean">
                          Did you make dinner?
                        </Label>
                      </div>
                      <RadioGroupItem value="scale" id="tracking-scale" />
                      <Label className="ml-1" htmlFor="tracking-scale">
                        How many meals did you cook today?
                      </Label>
                    </div>
                  ) : (
                    <Label htmlFor="tracking-boolean">
                      Please choose a category.
                    </Label>
                  )}
                </div>
              </RadioGroup>
            </div>
          ) : (
            <div></div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Habit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
