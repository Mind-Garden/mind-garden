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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';

import { getLocalISOString } from '@/lib/utils';
import { selectDataByRange } from '@/actions/data-visualization';

interface BarLineDataPoint {
  entry_date: string;
  rating: number;
  hours: number;
  tags: Array<string>;
}

interface BarLineChartProps {
  userId: string;
}

export default function BarLineChart({ userId }: Readonly<BarLineChartProps>) {
  const [data, setData] = useState<BarLineDataPoint[]>([]);
  const [type, setType] = useState('work');
  const [loading, setLoading] = useState(true);

  const todaysDate = getLocalISOString();
  const lastMonthDate = getLocalISOString(
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
  );

  const fetchData = async () => {
    setLoading(true);
    const response = await selectDataByRange(
      userId,
      lastMonthDate,
      todaysDate,
      type,
    );
    if (
      Array.isArray(response) &&
      response.every(
        (item: any) =>
          'entry_date' in item &&
          ((type === 'work' && 'work_rating' in item && 'work_hours' in item) ||
            (type === 'study' &&
              'study_rating' in item &&
              'study_hours' in item)) &&
          'tags' in item,
      )
    ) {
      setData(response);
      setLoading(false);
    } else {
      console.error('Unexpected response data format', response);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card className="font-body bg-white/50 break-inside-avoid backdrop-blur-sm rounded-2xl border-none mb-6 relative transition-opacity">
      <CardHeader className="pb-3">
        <CardTitle className="text-3xl text-center">
          {type === 'study' ? 'school day' : `${type} day`}
        </CardTitle>
        <CardDescription className="text-center">
          Visualizing your {type} hours and satisfaction ratings{' '}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <LoaderCircle className="h-12 w-12 text-gray-500 animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="h-16 text-center">No data yet! :( </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
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
                  label={{
                    value: 'Rating',
                    angle: 90,
                    position: 'insideRight',
                  }}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const entry = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">
                                Date
                              </span>
                              <span className="font-bold">
                                {entry.entry_date}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">
                                {type === 'work'
                                  ? 'Hours Worked'
                                  : 'Hours Studied'}
                              </span>
                              <span className="font-bold">
                                {entry[`${type}_hours`] ?? 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">
                                Day Rating
                              </span>
                              <span className="font-bold">
                                {entry[`${type}_rating`] !== null
                                  ? `${entry[`${type}_rating`]} / 5`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">
                                Tags
                              </span>
                              <span className="font-bold">
                                {entry.tags.length > 0
                                  ? entry.tags.join(', ')
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
                  dataKey={`${type}_hours`}
                  fill="#83e3c6"
                  yAxisId="left"
                  name={type === 'study' ? 'Hours Studied' : 'Hours Worked'}
                  radius={[10, 10, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey={`${type}_rating`}
                  stroke="#2ebb61"
                  yAxisId="right"
                  name="Satisfaction Rating"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setType('work')}
          >
            Work
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setType('study')}
          >
            School
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
