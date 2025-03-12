'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  insertResponses,
  selectResponsesByDate,
  updateResponses,
  addUserHabit, // New function to add habits to user's list
  getAddedCategories,
  getAddedResp,
  addResp,
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
import SickRating from './sick-rating';
import { getLocalISOString } from '@/lib/utils';

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
  const [sick, setSick] = useState(0);
  const [meals, setMeals] = useState(0);
  const [cooking, setCooking] = useState(0);
  const [smokingBool, setSmokingBool] = useState<boolean | null>(null);
  const [drinksBool, setDrinksBool] = useState<boolean | null>(null);
  const [sickBool, setSickBool] = useState<boolean | null>(null);
  const [breakfastBool, setBreakfastBool] = useState<boolean | null>(null);
  const [lunchBool, setLunchBool] = useState<boolean | null>(null);
  const [dinnerBool, setDinnerBool] = useState<boolean | null>(null);
  const [breakfastCookingBool, setBreakfastCookingBool] = useState<
    boolean | null
  >(null);
  const [lunchCookingBool, setLunchCookingBool] = useState<boolean | null>(
    null,
  );
  const [dinnerCookingBool, setDinnerCookingBool] = useState<boolean | null>(
    null,
  );

  const setVars = async (
    trackingMethod: Record<string, any>,
    method: string,
    setScaleFunc: (value: number) => void,
    setBoolFunc: (value: boolean | null) => void,
  ) => {
    if (method == 'scale') {
      setScaleFunc(trackingMethod[method]);
    } else if (method == 'boolean') {
      setBoolFunc(trackingMethod[method]);
    }
  };

  const setFoodVars = async (
    trackingMethod: Record<string, any>,
    method: string,
    setScaleFunc: (value: number) => void,
    setBreakFunc: (value: boolean | null) => void,
    setLunchFunc: (value: boolean | null) => void,
    setDinnerFunc: (value: boolean | null) => void,
  ) => {
    console.log(trackingMethod);
    if (method == 'scale') {
      setScaleFunc(trackingMethod[method]);
    } else if (method == 'breakfast') {
      setBreakFunc(trackingMethod[method]);
    } else if (method == 'lunch') {
      setLunchFunc(trackingMethod[method]);
    } else if (method == 'dinner') {
      setDinnerFunc(trackingMethod[method]);
    }
  };

  // Fetch function extracted
  const fetchResponses = useCallback(async () => {
    setLoadingSelection(true); // Show loading state during re-fetch
    try {
      const response = await selectResponsesByDate(
        userId,
        new Date().toISOString().split('T')[0],
      );

      const addedResponse = await getAddedResp(userId, getLocalISOString());
      if (addedResponse) {
        for (const resp of addedResponse) {
          const name = personalizedCategories.find(
            (cat) => cat.id == resp.habit,
          )?.name;
          const trackingMethod = resp.tracking_method as Record<string, any>;
          for (const method in trackingMethod) {
            console.log(method);
            if (name == 'smoking') {
              setVars(trackingMethod, method, setSmoking, setSmokingBool);
            } else if (name == 'alcohol') {
              setVars(trackingMethod, method, setDrinks, setDrinksBool);
            } else if (name == 'sick') {
              setVars(trackingMethod, method, setSick, setSickBool);
            } else if (name == 'meal') {
              setFoodVars(
                trackingMethod,
                method,
                setMeals,
                setBreakfastBool,
                setLunchBool,
                setDinnerBool,
              );
            } else if (name == 'cooking') {
              setFoodVars(
                trackingMethod,
                method,
                setMeals,
                setBreakfastCookingBool,
                setLunchCookingBool,
                setDinnerCookingBool,
              );
            }
          }
        }
      }

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

  const updateAddedCategories = (newCategory: string, newTracking: string) => {
    setAddedCategories((prevCategories) => {
      // Check if the category already exists
      const existingCategory = prevCategories?.find(
        (cat) => cat.added_habit === newCategory,
      );

      if (existingCategory) {
        // Update existing category
        return prevCategories?.map((cat) =>
          cat.added_habit === newCategory
            ? {
                ...cat,
                tracking_method: [
                  ...new Set([...cat.tracking_method, newTracking]),
                ], // Prevent duplicates
              }
            : cat,
        );
      } else if (prevCategories) {
        // Add new category
        return [
          ...prevCategories,
          {
            user: userId,
            added_habit: newCategory,
            tracking_method: [newTracking],
          },
        ];
      }
    });
  };

  const insertHabit = async (
    added_habit: string,
    trackingMethod: string[],
    scaleValue: number,
    boolValue: boolean | null,
  ) => {
    let responses = {};
    for (const method of trackingMethod) {
      if (method == 'scale') {
        responses = { ...responses, scale: scaleValue };
      } else {
        responses = { ...responses, boolean: boolValue };
      }
    }
    await addResp(userId, added_habit, responses, getLocalISOString());
  };

  const insertHabitFood = async (
    added_habit: string,
    trackingMethod: string[],
    scaleValue: number,
    breakfastValue: boolean | null,
    lunchValue: boolean | null,
    dinnerValue: boolean | null,
  ) => {
    let responses = {};
    for (const method of trackingMethod) {
      if (method == 'scale') {
        responses = { ...responses, scale: scaleValue };
      } else if (method == 'breakfast') {
        responses = { ...responses, breakfast: breakfastValue };
      } else if (method == 'lunch') {
        responses = { ...responses, lunch: lunchValue };
      } else if (method == 'dinner') {
        responses = { ...responses, dinner: dinnerValue };
      }
    }
    await addResp(userId, added_habit, responses, getLocalISOString());
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

    //insert new rows.
    addedCategories?.map((category) => {
      console.log(category);
      const name = personalizedCategories.find(
        (cat) => cat.id == category.added_habit,
      )?.name;
      if (name == 'smoking') {
        insertHabit(
          category.added_habit,
          category.tracking_method,
          smoking,
          smokingBool,
        );
      } else if (name == 'alcohol') {
        insertHabit(
          category.added_habit,
          category.tracking_method,
          drinks,
          drinksBool,
        );
      } else if (name == 'meal') {
        insertHabitFood(
          category.added_habit,
          category.tracking_method,
          meals,
          breakfastBool,
          lunchBool,
          dinnerBool,
        );
      } else if (name == 'cooking') {
        insertHabitFood(
          category.added_habit,
          category.tracking_method,
          meals,
          breakfastCookingBool,
          lunchCookingBool,
          dinnerCookingBool,
        );
      } else if (name == 'sick') {
        insertHabit(
          category.added_habit,
          category.tracking_method,
          sick,
          sickBool,
        );
      }
    });

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
    trackingMethod: 'boolean' | 'scale' | 'breakfast' | 'lunch' | 'dinner',
  ) => {
    try {
      // Call to database to save the new habit
      // This would add the habit to the user's list of tracked habits
      const result = await addUserHabit(userId, categoryId, trackingMethod);
      if (result && result != 'duplicate') {
        console.log('result' + result);
      }
      // Refresh the attributes list after adding a new habit
      // Note: In a real implementation, you might want to update the local state
      // or trigger a refetch of the attributes list
      if (result != 'duplicate') {
        updateAddedCategories(categoryId, trackingMethod);

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
              const methods = category.tracking_method;
              const name = personalizedCategories.find(
                (cat) => cat.id == category.added_habit,
              )?.name;
              return (
                <Card
                  key={name} // Single card per name
                  className={`bg-white/50 break-inside-avoid backdrop-blur-sm rounded-2xl border-none relative transition-opacity ${
                    submitting || !scaleSelection
                      ? 'opacity-50 pointer-events-none'
                      : 'opacity-100'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {methods.map((method) => {
                      if (method === 'scale' && name === 'smoking') {
                        return (
                          <QuantityTrackerSimple
                            key={method + name}
                            value={smoking}
                            onChange={setSmoking}
                            question="How many cigarettes today?"
                          />
                        );
                      } else if (method === 'scale' && name === 'alcohol') {
                        return (
                          <QuantityTrackerSimple
                            key={method + name}
                            value={drinks}
                            onChange={setDrinks}
                            question="How many drinks today?"
                          />
                        );
                      } else if (method === 'scale' && name === 'meal') {
                        return (
                          <QuantityTrackerSimple
                            key={method + name}
                            value={meals}
                            onChange={setMeals}
                            question="How many meals today?"
                          />
                        );
                      } else if (method === 'scale' && name === 'cooking') {
                        return (
                          <QuantityTrackerSimple
                            key={method + name}
                            value={cooking}
                            onChange={setCooking}
                            question="How many home-cooked meals today?"
                          />
                        );
                      } else if (method === 'scale' && name === 'sick') {
                        return (
                          <SickRating key={method + name} onChange={setSick} />
                        );
                      } else if (method === 'boolean' && name === 'alcohol') {
                        return (
                          <YesNoForm
                            key={method + name}
                            question="Did you drink today?"
                            onChange={setDrinksBool}
                            initialValue={drinksBool}
                          />
                        );
                      } else if (method === 'boolean' && name === 'smoking') {
                        return (
                          <YesNoForm
                            key={method + name}
                            question="Did you smoke today?"
                            onChange={setSmokingBool}
                            initialValue={smokingBool}
                          />
                        );
                      } else if (method === 'boolean' && name === 'sick') {
                        return (
                          <YesNoForm
                            key={method + name}
                            question="Were you sick today?"
                            onChange={setSickBool}
                            initialValue={sickBool}
                          />
                        );
                      } else if (method === 'breakfast' && name === 'meal') {
                        return (
                          <YesNoForm
                            key={method + name}
                            question="Did you eat breakfast today?"
                            onChange={setBreakfastBool}
                            initialValue={breakfastBool}
                          />
                        );
                      } else if (method === 'lunch' && name === 'meal') {
                        return (
                          <YesNoForm
                            key={method + name}
                            question="Did you eat lunch today?"
                            onChange={setLunchBool}
                            initialValue={lunchBool}
                          />
                        );
                      } else if (method === 'dinner' && name === 'meal') {
                        return (
                          <YesNoForm
                            key={method + name}
                            question="Did you eat dinner today?"
                            onChange={setDinnerBool}
                            initialValue={dinnerBool}
                          />
                        );
                      } else if (method === 'breakfast' && name === 'cooking') {
                        return (
                          <YesNoForm
                            key={method + name}
                            question="Did you make breakfast today?"
                            onChange={setBreakfastCookingBool}
                            initialValue={breakfastCookingBool}
                          />
                        );
                      } else if (method === 'lunch' && name === 'cooking') {
                        return (
                          <YesNoForm
                            key={method + name}
                            question="Did you make lunch today?"
                            onChange={setLunchCookingBool}
                            initialValue={lunchCookingBool}
                          />
                        );
                      } else if (method === 'dinner' && name === 'cooking') {
                        return (
                          <YesNoForm
                            key={method + name}
                            question="Did you make dinner today?"
                            onChange={setDinnerCookingBool}
                            initialValue={dinnerCookingBool}
                          />
                        );
                      } else {
                        return <div key={method + name}> Something else </div>;
                      }
                    })}
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
