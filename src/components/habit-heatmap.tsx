'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
} from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  getAllAddedRespCategory,
  getAddedCategories,
  getPersonalizedCategories,
} from '@/actions/data-intake';
import {
  IAddedCategory,
  type IAddedResp,
  IPersonalizedCategories,
} from '@/supabase/schema';

// Define the type for a single day's habit data
type HabitData = {
  id: string;
  user_id: string;
  habit: string;
  tracking_method?: Record<string, any>;
  entry_date: string;
};

interface HeatmapProps {
  readonly userId: string;
}

export default function HabitHeatmapGrid({ userId }: HeatmapProps) {
  // State to track the current month being displayed
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [habitData, setHabitData] =
    useState<Record<string, IAddedResp[] | null>>();
  const [addHabit, setAddedHabit] = useState<IAddedCategory[] | null>();
  const [personalizedCategories, setpersonalizedCategories] = useState<
    IPersonalizedCategories[] | null
  >();

  useEffect(() => {
    const fetchData = async () => {
      const addedHabits = await getAddedCategories(userId);
      setAddedHabit(addedHabits);
      const personalizedCategories = await getPersonalizedCategories();
      setpersonalizedCategories(personalizedCategories);
      let boolResp = {};

      if (addedHabits && personalizedCategories) {
        for (const resp of addedHabits) {
          const name = personalizedCategories.find(
            (cat) => cat.id == resp.added_habit,
          )?.name;
          if (
            name &&
            name != 'meal' &&
            name != 'cooking' &&
            resp.tracking_method.includes('boolean')
          ) {
            //get data for category.added_habit that is yes/no question
            const catResp = await getAllAddedRespCategory(
              userId,
              resp.added_habit,
            );

            boolResp = { ...boolResp, [name]: catResp };
          } else if (
            (name && resp.tracking_method.includes('breakfast')) ||
            resp.tracking_method.includes('lunch') ||
            resp.tracking_method.includes('dinner')
          ) {
            //get data for category.added_habit that is yes/no question
            const catResp = await getAllAddedRespCategory(
              userId,
              resp.added_habit,
            );

            if (name) {
              boolResp = { ...boolResp, [name]: catResp };
            }
          }
        }
      }

      setHabitData(boolResp);
      console.log(boolResp);
    };
    fetchData();
  }, [userId]);

  // Get all days in the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate the day of the week for the first day of the month (0 = Sunday, 6 = Saturday)
  const startDay = getDay(monthStart);

  // Navigation functions for changing months
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Function to get habit data for a specific date
  const getHabitDataForDate = (category: string, date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    let out;
    if (habitData && habitData[category]) {
      out = habitData[category]?.find(
        (data) => data.entry_date === formattedDate,
      );
    }
    return out;
  };

  // Function to calculate the completion value for a day
  const getValue = (method: string, data?: IAddedResp) => {
    if (data && data.tracking_method) {
      console.log(method);
      console.log(data.tracking_method[method]);
      return data.tracking_method[method];
    }
    return false;
  };

  // Function to get the appropriate background color based on completion value
  const getBackgroundColor = (value: boolean) => {
    if (!value) return 'bg-muted';
    if (value) return '!bg-green-500 dark:!bg-green-650';
    return '!bg-green-700 dark:!bg-green-500';
  };

  // Function to get all tracking methods for a category
  const getTrackingMethodsForCategory = (category: string): string[] => {
    if (addHabit && (category === 'meal' || category === 'cooking')) {
      let out: string[] = [];
      for (const category of addHabit) {
        const name = personalizedCategories?.find(
          (cat) => cat.id == category.added_habit,
        )?.name;
        if (name == 'meal' || name === 'cooking') {
          console.log(category.added_habit);
          console.log(category);
          if (category.tracking_method.includes('breakfast')) {
            out = [...out, 'breakfast'];
          } else if (category.tracking_method.includes('lunch')) {
            out = [...out, 'lunch'];
          } else if (category.tracking_method.includes('dinner')) {
            out = [...out, 'dinner'];
          }
        }
      }
      console.log(out);
      return out;
    }
    return ['boolean']; // Default for other categories
  };

  // Render the calendar grid for a specific category and tracking method
  const renderHeatmap = (category: string, trackingMethod: string) => {
    const displayName =
      trackingMethod === 'boolean'
        ? category
        : `${category} - ${trackingMethod}`;

    return (
      <div key={`${category}-${trackingMethod}`} className="mb-10">
        <h3 className="text-xl font-semibold mb-4 capitalize">{displayName}</h3>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before the start of the month */}
          {Array.from({ length: startDay }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square"></div>
          ))}

          {/* Days of the month */}
          <TooltipProvider>
            {daysInMonth.map((day) => {
              const dayData = getHabitDataForDate(category, day);
              const completionValue = getValue(trackingMethod, dayData);
              const backgroundColor = getBackgroundColor(completionValue);

              return (
                <Tooltip key={day.toString()}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'aspect-square rounded-md flex items-center justify-center cursor-pointer transition-colors',
                        backgroundColor,
                      )}
                    >
                      <span className="text-sm">{format(day, 'd')}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <p className="font-medium">
                        {format(day, 'MMMM d, yyyy')}
                      </p>
                      {dayData ? (
                        <div className="mt-1">
                          <p>
                            {trackingMethod === 'boolean'
                              ? category
                              : `${category} - ${trackingMethod}`}
                            : {completionValue ? '✅' : '❌'}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-1">No data recorded</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Habit Tracker</h2>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Render heatmaps for each category and its tracking methods */}
      {habitData &&
        Object.keys(habitData).map((category) => {
          const trackingMethods = getTrackingMethodsForCategory(category);
          return trackingMethods.map((method) =>
            renderHeatmap(category, method),
          );
        })}

      {/* Show loading or empty state if no data */}
      {!habitData && (
        <div className="text-center py-10">
          <p>Loading habit data...</p>
        </div>
      )}

      {habitData && Object.keys(habitData).length === 0 && (
        <div className="text-center py-10">
          <p>No habit categories found.</p>
        </div>
      )}
    </div>
  );
}
