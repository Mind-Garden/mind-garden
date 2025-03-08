'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  insertResponses,
  selectResponsesByDate,
  updateResponses,
  addUserHabit, // New function to add habits to user's list
  getAddedCategories,
} from '@/actions/data-intake';
import AttributeIcon from '@/components/data-intake/attribute-icon';
import ToggleButton from '@/components/data-intake/toggle-button';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Plus } from 'lucide-react';
import type {
  IAttributes,
  ICategories,
  IPersonalizedCategories,
  IAddedCategory,
} from '@/supabase/schema';
import ScaleIcon from '@/components/data-intake/scale-icon';
import AddHabitDialog from '@/components/data-intake/add-habit';
import { toast } from 'react-toastify';
import { MinusCircle, PlusCircle } from 'lucide-react';
import QuantityTrackerSimple from './quantity-tracker';
import YesNoForm from './yes-no-form';

interface DataIntakeFormProps {
  userId: string;
  categories: Array<ICategories>;
  attributes: Array<IAttributes>;
  personalizedCategories: Array<IPersonalizedCategories>;
}

function DataIntakeForm({
  userId,
  categories,
  attributes,
  personalizedCategories,
}: DataIntakeFormProps) {
  const [currentSelection, setCurrentSelection] = useState<Set<string>>(
    new Set(),
  );
  const [responseId, setResponseId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingSelection, setLoadingSelection] = useState(true);
  const [completedForm, setCompletedForm] = useState(false);
  const [scaleSelection, setScaleSelection] = useState<number | null>(null);
  const [scaleError, setScaleError] = useState(false);
  const [showAddHabitDialog, setShowAddHabitDialog] = useState(false);
  const [addedCategories, setAddedCategories] = useState<IAddedCategory[]>();
  const [smoking, setSmoking] = useState(0);
  const [drinks, setDrinks] = useState(0);
  // const smoking = 0;

  // Fetch function extracted
  const fetchResponses = useCallback(async () => {
    setLoadingSelection(true); // Show loading state during re-fetch
    try {
      const response = await selectResponsesByDate(
        userId,
        new Date().toISOString().split('T')[0],
      );

      setCurrentSelection(new Set(response?.attribute_ids ?? []));
      setScaleSelection(response?.scale_rating ?? null);
      setResponseId(response?.id ?? null);
      setCompletedForm(!!response);

      const added = await getAddedCategories(userId);
      if (added) setAddedCategories(added);
    } catch (err) {
      console.error('Error fetching table data:', err);
    } finally {
      setLoadingSelection(false);
    }
  }, [userId]);

  // Initial fetch in useEffect
  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  // Memoized attribute map
  const attributesByCategory = useMemo(() => {
    const map = new Map<string, Array<IAttributes>>();
    if (attributes.length && categories) {
      categories.forEach((category) => {
        map.set(
          category.id,
          attributes.filter((attr) => attr.category_id === category.id),
        );
      });
    }
    return map;
  }, [categories, attributes]);

  // Handle toggling attributes
  const handleToggle = useCallback((attributeId: string) => {
    setCurrentSelection((prev) => {
      const next = new Set(prev);
      next.has(attributeId) ? next.delete(attributeId) : next.add(attributeId);
      return new Set(next);
    });
  }, []);

  // const updateAddedCategories = (newCategory: string, newTracking: string) => {
  //   if(addedCategories){
  //     const habitArray = [...addedCategories.added_habits, newCategory]
  //     const trackingArray = [...addedCategories.tracking_method, newTracking]
  //     const newAddedCat = {user: userId, added_habits: habitArray, tracking_method: trackingArray}
  //     setAddedCategories(newAddedCat);
  //   }
  const handleSmokingIncrement = () => {
    if (smoking < 100) {
      setSmoking(smoking + 1);
    }
  };

  // Handle decrement
  const handleSmokingDecrement = () => {
    if (smoking > 0) {
      setSmoking(smoking - 1);
    }
  };
  // };
  const handleSmokingChange = (newValue: number) => {
    console.log('Updating smoking state to:', newValue);
    setSmoking(newValue + 1);
  };
  // Submit handler
  const handleSubmit = async (): Promise<void> => {
    // Prevent multiple submissions at once
    if (submitting) return;

    if (scaleSelection === null) {
      setScaleError(true); // Show error message
      return;
    }

    setSubmitting(true);
    setScaleError(false);

    try {
      if (!responseId) {
        // Insert new selection if no previous responses exist
        await insertResponses(currentSelection, userId, scaleSelection);
      } else {
        // Update if both responses already exist
        await updateResponses(
          responseId,
          currentSelection,
          userId,
          scaleSelection,
        );
      }

      await fetchResponses();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setCompletedForm(currentSelection.size !== 0);
      setSubmitting(false);
    }
  };

  const handleScaleToggle = useCallback((rating: number): void => {
    setScaleSelection((prev) => (prev === rating ? null : rating));
    if (scaleSelection) setScaleError(false);
  }, []);

  // Handle adding a new habit
  const handleAddHabit = async (
    categoryId: string,
    trackingMethod: 'boolean' | 'scale',
  ) => {
    try {
      // Call to database to save the new habit
      // This would add the habit to the user's list of tracked habits
      const result = await addUserHabit(userId, categoryId, trackingMethod);

      // Refresh the attributes list after adding a new habit
      // Note: In a real implementation, you might want to update the local state
      // or trigger a refetch of the attributes list
      if (result == 'success') {
        // updateAddedCategories(categoryId, trackingMethod);

        // Close the dialog
        setShowAddHabitDialog(false);
      } else {
        toast.error('You have already added this habit.');
      }
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  if (loadingSelection) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <LoaderCircle className="justify-center h-10 w-10 animate-spin min-h-screen" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2">
      <div className="bg-white/50 backdrop-blur-sm mt-4 mx-4 rounded-full mb-6 py-4 px-2">
        <div className="container mx-auto px-4 py-4 h-16 flex items-center justify-between">
          <div className="flex flex-col items-left pl-2">
            <p className="text-2xl font-semibold text-black">
              Daily Habit Form
            </p>
            {completedForm ? (
              <p className="text-center text-sm text-gray-500">
                You have completed your habit form for the day! You may edit and
                resubmit at any time.
              </p>
            ) : (
              <p className="text-center text-sm text-gray-500">
                You have yet to complete your habit form for the day. Place your
                selections and submit.
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 pr-4">
            <Button
              variant="outline"
              className="rounded-xl bg-transparent border-green-100/50 hover:bg-white/30"
              onClick={() => setShowAddHabitDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Habit
            </Button>
            <Button
              variant="outline"
              className="rounded-xl bg-transparent border-green-100/50 hover:bg-white/30"
              onClick={handleSubmit}
              disabled={submitting}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>

      {/* Wrap to make them relative for visual effects */}
      <div className="relative">
        {/* Loading spinner */}
        {submitting && (
          <div className="absolute inset-0 bg-gray-100/70 flex items-center justify-center rounded-2xl z-10">
            <LoaderCircle className="h-12 w-12 text-gray-500 animate-spin" />
          </div>
        )}

        {/* Scale Selection */}
        <div
          className={`flex flex-col items-center py-4 bg-white/50 rounded-full mb-6 z-10 transition-opacity ${submitting ? 'opacity-50' : 'opacity-100'}`}
        >
          <p className="font-bold text-xl">Rate your day:</p>
          <div className="flex justify-center gap-4 mt-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <ToggleButton<number>
                key={rating}
                value={rating}
                isSelected={scaleSelection === rating}
                onChange={handleScaleToggle}
                disabled={submitting}
              >
                <ScaleIcon scaleRating={rating} />
              </ToggleButton>
            ))}
          </div>

          {scaleError && (
            <p className="text-red-500 mt-2 text-sm">
              Please select a scale rating before submitting.
            </p>
          )}
        </div>

        {/* Card Grid */}
        <div className={'columns-1 md:columns-2 space-y-4'}>
          {categories.map((category) => {
            const categoryAttributes =
              attributesByCategory.get(category.id) || [];
            if (categoryAttributes.length === 0) return null;

            return (
              <Card
                key={category.id}
                className={`bg-white/50 break-inside-avoid backdrop-blur-sm rounded-2xl border-none relative transition-opacity ${
                  submitting || !scaleSelection
                    ? 'opacity-50 pointer-events-none'
                    : 'opacity-100'
                }`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap justify-center gap-2">
                    {categoryAttributes.map((attr: IAttributes) => (
                      <ToggleButton<string>
                        key={attr.id}
                        value={attr.id}
                        isSelected={currentSelection.has(attr.id)}
                        onChange={handleToggle}
                        disabled={submitting || !scaleSelection}
                      >
                        <span className="flex items-center gap-0.5">
                          <AttributeIcon
                            category={category.name}
                            attribute={attr.name}
                          />
                          {attr.name}
                        </span>
                      </ToggleButton>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {addedCategories &&
            addedCategories.map((category) => {
              console.log(category.added_habit);
              const method = category.tracking_method;
              const name = personalizedCategories.find(
                (cat) => cat.id == category.added_habit,
              )?.name;
              return (
                <Card
                  key={category.id}
                  className={`bg-white/50 break-inside-avoid backdrop-blur-sm rounded-2xl border-none relative transition-opacity ${
                    submitting || !scaleSelection
                      ? 'opacity-50 pointer-events-none'
                      : 'opacity-100'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {method == 'scale' && name == 'smoking' ? (
                      <QuantityTrackerSimple
                        value={smoking}
                        onChange={setSmoking}
                      />
                    ) : method == 'scale' && name == 'alcohol' ? (
                      <QuantityTrackerSimple
                        value={drinks}
                        onChange={setDrinks}
                      />
                    ) : method == 'boolean' && name == 'alcohol' ? (
                      <YesNoForm question="Did you drink today?" />
                    ) : (
                      <div> something else </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>

      {/* Add Habit Dialog */}
      <AddHabitDialog
        open={showAddHabitDialog}
        onOpenChange={setShowAddHabitDialog}
        categories={personalizedCategories}
        onAddHabit={handleAddHabit}
      />
    </div>
  );
}

export default React.memo(DataIntakeForm);
