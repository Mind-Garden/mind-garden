'use client';

import { useState, useEffect } from 'react';
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { getLocalISOString } from '@/lib/utils';
import { selectWorkDataByDateRange } from '@/actions/data-visualization';

interface WorkDataPoint {
  entry_date: string;
  work_rating: number;
  work_hours: number;
  tags: Array<string>;
}

interface WorkChartProps {
  userId: string;
}

export default function WorkChart({ userId }: Readonly<WorkChartProps>) {
  const [workData, setWorkData] = useState<WorkDataPoint[]>([]);

  const todaysDate = getLocalISOString();
  const lastMonthDate = getLocalISOString(
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
  );

  useEffect(() => {
    const fetchSleepData = async () => {
      // Fetch sleep data from the last month
      const response = await selectWorkDataByDateRange(
        userId,
        lastMonthDate,
        todaysDate,
      );
      console.log(response);
      if (
        Array.isArray(response.data) &&
        response.data.every(
          (item) =>
            'entry_date' in item &&
            'work_rating' in item &&
            'work_hours' in item &&
            'tags' in item,
        )
      ) {
        const workData = response.data as WorkDataPoint[];
        setWorkData(workData);
      } else {
        console.error('Unexpected response data format', response.data);
      }
    };
    fetchSleepData();
  }, []);

  return (
    <Card className="bg-white/50 break-inside-avoid backdrop-blur-sm rounded-2xl border-none mb-6 relative transition-opacity">
      <CardHeader className="pb-3">
        <CardTitle className="text-3xl text-center">Work Hours</CardTitle>
        <CardDescription className="text-center">
          Visualizing your work hours and satisfaction ratings{' '}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={workData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="grey"
              />
              <XAxis dataKey="entry_date" tickLine={false} />
              <YAxis
                yAxisId="left"
                orientation="left"
                domain={[0, 10]}
                label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 5]}
                label={{ value: 'Rating', angle: 90, position: 'insideRight' }}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">
                              Date
                            </span>
                            <span className="font-bold">
                              {payload[0].payload.entry_date}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">
                              Hours
                            </span>
                            <span className="font-bold">
                              {payload[0].payload.work_hours ?? 'N/A'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">
                              Rating
                            </span>
                            <span className="font-bold">
                              {payload[0].payload.work_rating !== null
                                ? `${payload[0].payload.work_rating}/5`
                                : 'N/A'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">
                              Tags
                            </span>
                            <span className="font-bold">
                              {payload[0].payload.tags.length > 0
                                ? payload[0].payload.tags.join(', ')
                                : 'None'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar
                dataKey="work_hours"
                fill="#83e3c6"
                yAxisId="left"
                name="Hours Worked"
                radius={[10, 10, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="work_rating"
                stroke="#2ebb61"
                yAxisId="right"
                name="Satisfaction Rating"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            Last 7 Days
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            Last 30 Days
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            This Month
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
