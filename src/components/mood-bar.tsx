'use client';

import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { selectMoodFrequency } from '@/actions/data-visualization';
import { useState, useEffect } from 'react';
import { getLocalISOString } from '@/lib/utils';
import { MoodCountData, MoodDistribution } from '@/supabase/schema';
import ScaleIcon from './data-intake/scale-icon';

// Define mood types with their properties
const moodTypes = [
  {
    id: 5,
    color: '#FFDD85',
    emoji: '😁', // <ScaleIcon scaleRating={5} /> if we don't want emojis
    label: 'Excellent',
  },
  {
    id: 4,
    color: '#D4E6A5',
    emoji: '😊', // <ScaleIcon scaleRating={4} />
    label: 'Good',
  },
  {
    id: 3,
    color: '#9ACBAD',
    emoji: '😐', // <ScaleIcon scaleRating={3} />
    label: 'Neutral',
  },
  {
    id: 2,
    color: '#5EB17F',
    emoji: '😔', // <ScaleIcon scaleRating={2} />
    label: 'Poor',
  },
  {
    id: 1,
    color: '#9E9E9E',
    emoji: '😫', // <ScaleIcon scaleRating={1} />
    label: 'Terrible',
  },
];

interface MoodBarProps {
  // Array of mood distribution data with id and percentage
  userId: string;
  title?: string;
}

export default function MoodBar({
  userId,
  title = 'Mood Bar',
}: Readonly<MoodBarProps>) {
  const [moodDistribution, setMoodDistribution] = useState<MoodDistribution[]>(
    [],
  );
  const [totalCount, setTotalCount] = useState<number>(0);
  const todaysDate = getLocalISOString();
  const lastMonthDate = getLocalISOString(
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
  );

  // Create a map of moods for easy look up
  const moodMap = Object.fromEntries(moodTypes.map((mood) => [mood.id, mood]));

  useEffect(() => {
    const fetchMoodData = async () => {
      try {
        const response = await selectMoodFrequency(
          userId,
          lastMonthDate,
          todaysDate,
        );
        const moodData = response.data as MoodCountData[];

        // Calculate total count
        const totalCount = moodData.reduce(
          (sum, item) => sum + (item.count || 0),
          0,
        );

        if (totalCount === 0) {
          console.warn('Total count is 0, avoiding division by zero.');
          setMoodDistribution([]);
          setTotalCount(0);
          return;
        }

        // Convert counts into percentage distribution
        const moodDistribution = moodData.map((mood) => ({
          id: mood.scale_rating.toString(),
          percentage: Math.round((mood.count / totalCount) * 100),
        }));

        // Update state
        setMoodDistribution(moodDistribution);
        setTotalCount(totalCount);
      } catch (error) {
        console.error('Error fetching mood data:', error);
      }
    };

    fetchMoodData();
  }, [userId]); // Refetch when userId changes

  return (
    <div>
      <Card className="bg-white backdrop-blur-sm rounded-2xl border-none w-1/3">
        <CardTitle className="text-2xl font-bold mb-2 opacity-50 text-center">
          {title}
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          from {lastMonthDate} to {todaysDate}
        </CardDescription>

        <div className="flex justify-center items-center mb-6 p-4">
          {moodDistribution.length === 0 ? (
            // No data available message
            <div className="h-16 text-center">No data yet! :( </div>
          ) : (
            moodDistribution.map((item) => {
              const mood = moodMap[item.id];
              return (
                <div key={item.id} className="flex flex-col items-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
                    style={{ backgroundColor: mood.color }}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                  </div>
                  <div className="text-center font-medium">
                    {item.percentage}%
                  </div>
                </div>
              );
            })
          )}
        </div>

        {moodDistribution.length > 0 && (
          <div className="h-6 w-full rounded-full overflow-hidden flex">
            {moodDistribution.map((item) => {
              const mood = moodMap[item.id];
              return (
                <div
                  key={item.id}
                  className="h-full"
                  style={{
                    backgroundColor: mood.color,
                    width: `${(item.percentage / totalCount) * 100}%`,
                  }}
                />
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
