'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { selectMoodDataByDateRange } from '@/actions/data-visualization';
import { getLocalISOString } from '@/lib/utils';
import AnimatedLineGraph from './ui/line-graph';
import { DataPoint, MoodDataPoint, MoodFlowProps } from '@/supabase/schema';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export default function MoodFlow({
  userId,
  title = 'Mood Flow',
}: Readonly<MoodFlowProps>) {
  const [moodData, setMoodData] = useState<DataPoint[]>([]);

  const todaysDate = getLocalISOString();
  const lastMonthDate = getLocalISOString(
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
  );

  useEffect(() => {
    const fetchMoodData = async () => {
      const response = await selectMoodDataByDateRange(
        userId,
        lastMonthDate,
        todaysDate,
      );

      if (
        Array.isArray(response.data) &&
        response.data.every(
          (item) => 'entry_date' in item && 'scale_rating' in item,
        )
      ) {
        const moodData = response.data as MoodDataPoint[];

        // Convert to x, y format
        const formattedData = moodData.map((item) => ({
          x: item.entry_date, // Convert date string to Date object
          y: item.scale_rating, // Scale rating as y-axis value
        }));

        setMoodData(formattedData);
      } else {
        console.error('Unexpected response data format', response.data);
      }
    };

    fetchMoodData();
  }, []);

  return (
    <div>
      <Card className="bg-white backdrop-blur-sm rounded-2xl border-none">
        <CardTitle className="text-2xl font-bold mb-2 opacity-50 text-center">
          {title}
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          from {lastMonthDate} to {todaysDate}
        </CardDescription>
        <CardContent>
          {moodData.length === 0 ? (
            // If no moodData
            <div className="h-16 text-center">No data yet! :( </div>
          ) : (
            // If there is moodData, render the chart
            <div className="h-64 mx-auto">
              <AnimatedLineGraph data={moodData} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
