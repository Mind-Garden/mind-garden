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
import QuantityTrackerSimple from './quantity-tracker';
import YesNoForm from './yes-no-form';
import { getLocalISOString } from '@/lib/utils';

import CounterCard from '@/components/ui/counter-card';
import Counter from '@/components/ui/counter';
import { RatingScale } from '@/components/ui/rating-scale';

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
    // Set variables for habits like smoking or alcohol
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
    // Set variables for habits like meal or cooking
    trackingMethod: Record<string, any>,
    method: string,
    setScaleFunc: (value: number) => void,
    setBreakFunc: (value: boolean | null) => void,
    setLunchFunc: (value: boolean | null) => void,
    setDinnerFunc: (value: boolean | null) => void,
  ) => {
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

  const [water, setWater] = useState<number | null>(null);
  const [studyHours, setStudyHours] = useState<number | null>(null);
  const [studyRating, setStudyRating] = useState<number | null>(null);
  const [workHours, setWorkHours] = useState<number | null>(null);
  const [workRating, setWorkRating] = useState<number | null>(null);

  const emotionsCategory = categories.find(
    (category) => category.name === 'emotions',
  );
  const workCategory = categories.find((category) => category.name === 'work');
  const schoolCategory = categories.find(
    (category) => category.name === 'school',
  );

  // Fetch function extracted
  const fetchResponses = useCallback(async () => {
    setLoadingSelection(true); // Show loading state during re-fetch
    try {
      const response = await selectResponsesByDate(userId, getLocalISOString());
      const addedResponse = await getAddedResp(userId, getLocalISOString());

      if (addedResponse) {
        for (const resp of addedResponse) {
          const name = personalizedCategories.find(
            (cat) => cat.id == resp.habit,
          )?.name;
          const trackingMethod = resp.tracking_method as Record<string, any>;

          for (const method in trackingMethod) {
            // Set variables from responses
            switch (name) {
              case 'smoking':
                setVars(trackingMethod, method, setSmoking, setSmokingBool);
                break;
              case 'alcohol':
                setVars(trackingMethod, method, setDrinks, setDrinksBool);
                break;
              case 'sick':
                setVars(trackingMethod, method, setSick, setSickBool);
                break;
              case 'meal':
                setFoodVars(
                  trackingMethod,
                  method,
                  setMeals,
                  setBreakfastBool,
                  setLunchBool,
                  setDinnerBool,
                );
                break;
              case 'cooking':
                setFoodVars(
                  trackingMethod,
                  method,
                  setCooking,
                  setBreakfastCookingBool,
                  setLunchCookingBool,
                  setDinnerCookingBool,
                );
                break;
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
      setWater(response?.water ?? null);
      setStudyHours(response?.study_hours ?? null);
      setStudyRating(response?.study_rating ?? null);
      setWorkHours(response?.work_hours ?? null);
      setWorkRating(response?.work_rating ?? null);
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
    // Insert new habit like smoking or alcohol
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
    // Insert new habit like meal or cooking
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
        await insertResponses(
          currentSelection,
          userId,
          scaleSelection,
          water,
          workHours,
          workRating,
          studyHours,
          studyRating,
        );
      } else {
        // Update if both responses already exist
        await updateResponses(
          responseId,
          currentSelection,
          userId,
          scaleSelection,
          water,
          workHours,
          workRating,
          studyHours,
          studyRating,
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

  const renderTrackerComponent = (method: string, name: string | undefined) => {
    // Show component based on what habits have been added
    const trackerMap: Record<string, any> = {
      'scale:smoking': (
        <QuantityTrackerSimple
          key={method + name}
          value={smoking}
          onChange={setSmoking}
          question="How many cigarettes today?"
        />
      ),
      'scale:alcohol': (
        <QuantityTrackerSimple
          key={method + name}
          value={drinks}
          onChange={setDrinks}
          question="How many drinks today?"
        />
      ),
      'scale:meal': (
        <QuantityTrackerSimple
          key={method + name}
          value={meals}
          onChange={setMeals}
          question="How many meals today?"
        />
      ),
      'scale:cooking': (
        <QuantityTrackerSimple
          key={method + name}
          value={cooking}
          onChange={setCooking}
          question="How many home-cooked meals today?"
        />
      ),
      'scale:sick': (
        <RatingScale
          key={method + name}
          value={sick}
          onChange={setSick}
          leftLabel="Sick"
          rightLabel="Healthy"
        />
      ),
      'boolean:alcohol': (
        <YesNoForm
          key={method + name}
          question="Did you drink today?"
          onChange={setDrinksBool}
          initialValue={drinksBool}
        />
      ),
      'boolean:smoking': (
        <YesNoForm
          key={method + name}
          question="Did you smoke today?"
          onChange={setSmokingBool}
          initialValue={smokingBool}
        />
      ),
      'boolean:sick': (
        <YesNoForm
          key={method + name}
          question="Were you sick today?"
          onChange={setSickBool}
          initialValue={sickBool}
        />
      ),
      'breakfast:meal': (
        <YesNoForm
          key={method + name}
          question="Did you eat breakfast today?"
          onChange={setBreakfastBool}
          initialValue={breakfastBool}
        />
      ),
      'lunch:meal': (
        <YesNoForm
          key={method + name}
          question="Did you eat lunch today?"
          onChange={setLunchBool}
          initialValue={lunchBool}
        />
      ),
      'dinner:meal': (
        <YesNoForm
          key={method + name}
          question="Did you eat dinner today?"
          onChange={setDinnerBool}
          initialValue={dinnerBool}
        />
      ),
      'breakfast:cooking': (
        <YesNoForm
          key={method + name}
          question="Did you make breakfast today?"
          onChange={setBreakfastCookingBool}
          initialValue={breakfastCookingBool}
        />
      ),
      'lunch:cooking': (
        <YesNoForm
          key={method + name}
          question="Did you make lunch today?"
          onChange={setLunchCookingBool}
          initialValue={lunchCookingBool}
        />
      ),
      'dinner:cooking': (
        <YesNoForm
          key={method + name}
          question="Did you make dinner today?"
          onChange={setDinnerCookingBool}
          initialValue={dinnerCookingBool}
        />
      ),
    };

    return (
      trackerMap[`${method}:${name}`] || (
        <div key={method + name}>Something else</div>
      )
    );
  };

  if (loadingSelection) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <LoaderCircle className="justify-center h-10 w-10 animate-spin min-h-screen" />
      </div>
    );
  }

  return (
    <div className="font-body w-full max-w-4xl mx-auto pb-2 rounded-2xl bg-gradient-to-r from-blue-200/50 via-aqua-100/50 to-teal-100/50 backdrop-blur-md">
      <div className="backdrop-blur-sm mb-6 px-2 rounded-t-2xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between h-16">
            <p className="text-3xl font-semibold text-black font-title pl-2">
              Daily Habit Form
            </p>
            <div className="flex items-center gap-4 pr-4">
              <Button
                variant="outline"
                className="rounded-xl bg-transparent border-green-100/50 hover:bg-black/10"
                onClick={() => setShowAddHabitDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Habit
              </Button>
              <Button
                variant="outline"
                className="rounded-xl bg-transparent border-green-100/50 hover:bg-black/10"
                onClick={handleSubmit}
                disabled={submitting}
              >
                Submit
              </Button>
            </div>
          </div>
          <div className="pl-2">
            {completedForm ? (
              <p className="text-sm text-gray-500">
                You have completed your habit form for the day! You may edit and
                resubmit at any time.
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                You have yet to complete your habit form for the day. Place your
                selections and submit.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Wrap to make them relative for visual effects */}
      <div className="relative px-4">
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
          <p className="font-bold text-xl">Rate Your Day</p>
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
        {/* Emotions Category */}
        {emotionsCategory && (
          <Card
            key={emotionsCategory.id}
            className={`bg-white/50 break-inside-avoid backdrop-blur-sm rounded-2xl border-none mb-6 relative transition-opacity ${
              submitting || !scaleSelection
                ? 'opacity-50 pointer-events-none'
                : 'opacity-100'
            }`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-semibold">
                {emotionsCategory.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-2">
                {attributesByCategory.get(emotionsCategory.id)?.map((attr) => (
                  <ToggleButton<string>
                    key={attr.id}
                    value={attr.id}
                    isSelected={currentSelection.has(attr.id)}
                    onChange={handleToggle}
                    disabled={submitting || !scaleSelection}
                  >
                    <span className="flex items-center">
                      <AttributeIcon
                        category={emotionsCategory.name}
                        attribute={attr.name}
                      />
                      {attr.name}
                    </span>
                  </ToggleButton>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* School Category Card */}
          {schoolCategory && (
            <Card
              key={schoolCategory.id}
              className={`bg-white/50 break-inside-avoid backdrop-blur-sm rounded-2xl border-none mb-6 relative transition-opacity ${
                submitting || !scaleSelection
                  ? 'opacity-50 pointer-events-none'
                  : 'opacity-100'
              }`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{schoolCategory.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {'How many hours did you study today?'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 pt-4 pb-4">
                  <Counter
                    value={studyHours ?? 0}
                    onChange={setStudyHours}
                    disabled={submitting || !scaleSelection}
                  />
                </div>
                <div className="space-y-3 border-t pt-4 pb-4">
                  <label className="text-sm font-medium">
                    {'How would you rate your school day?'}
                  </label>
                  <RatingScale
                    value={studyRating ?? 0}
                    onChange={setStudyRating}
                    leftLabel="Poor"
                    rightLabel="Excellent"
                  />
                </div>
                <div className="flex flex-wrap justify-center gap-2 border-t pt-4">
                  {attributesByCategory.get(schoolCategory.id)?.map((attr) => (
                    <ToggleButton<string>
                      key={attr.id}
                      value={attr.id}
                      isSelected={currentSelection.has(attr.id)}
                      onChange={handleToggle}
                      disabled={submitting || !scaleSelection}
                    >
                      <span className="flex items-center gap-0.5">
                        <AttributeIcon
                          category={schoolCategory.name}
                          attribute={attr.name}
                        />
                        {attr.name}
                      </span>
                    </ToggleButton>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Work Category Card */}
          {workCategory && (
            <Card
              key={workCategory.id}
              className={`bg-white/50 break-inside-avoid backdrop-blur-sm rounded-2xl border-none mb-6 relative transition-opacity ${
                submitting || !scaleSelection
                  ? 'opacity-50 pointer-events-none'
                  : 'opacity-100'
              }`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{workCategory.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {'How many hours did you work today?'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 pt-4 pb-4">
                  <Counter
                    value={workHours ?? 0}
                    onChange={setWorkHours}
                    disabled={submitting || !scaleSelection}
                  />
                </div>
                <div className="space-y-3 border-t pt-4 pb-4">
                  <label className="text-sm font-medium">
                    {'How would you rate your work day?'}
                  </label>
                  <RatingScale
                    value={workRating ?? 0}
                    onChange={setWorkRating}
                    leftLabel="Poor"
                    rightLabel="Excellent"
                  />
                </div>
                <div className="flex flex-wrap justify-center gap-2 border-t pt-4">
                  {attributesByCategory.get(workCategory.id)?.map((attr) => (
                    <ToggleButton<string>
                      key={attr.id}
                      value={attr.id}
                      isSelected={currentSelection.has(attr.id)}
                      onChange={handleToggle}
                      disabled={submitting || !scaleSelection}
                    >
                      <span className="flex items-center gap-0.5">
                        <AttributeIcon
                          category={workCategory.name}
                          attribute={attr.name}
                        />
                        {attr.name}
                      </span>
                    </ToggleButton>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Water Intake Card*/}
          <CounterCard
            title="water"
            description="How many cups of water did you drink today?"
            value={water ?? 0}
            onChange={setWater}
            disabled={submitting || !scaleSelection}
          />
          {addedCategories &&
            addedCategories.map((category) => {
              const name = personalizedCategories.find(
                (cat) => cat.id == category.added_habit,
              )?.name;
              const methods = category.tracking_method;

              return (
                <Card
                  key={name}
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
                    {methods.map((method) =>
                      renderTrackerComponent(method, name),
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
