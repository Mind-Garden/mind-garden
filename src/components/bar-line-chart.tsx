'use client';

import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { selectDataByRange } from '@/actions/data-visualization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getLocalISOString } from '@/lib/utils';
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

  // fetch data for the selected type
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

  // Formate date to display in Month, day, year format
  const formatDate = (dateString: string, showYear = true) => {
    try {
      const date = new Date(dateString + 'T00:00:00Z');
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        ...(showYear && { year: 'numeric' }),
        timeZone: 'UTC',
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div>
      <div className="mt-4 pb-5 flex flex-wrap justify-center">
        {/* buttons to switch between work and school day graphs */}
        <Button
          variant={type === 'work' ? 'default' : 'outline'}
          size="sm"
          className="rounded-full"
          onClick={() => setType('work')}
        >
          Work Day
        </Button>
        <Button
          variant={type === 'study' ? 'default' : 'outline'}
          size="sm"
          className="rounded-full"
          onClick={() => setType('study')}
        >
          School Day
        </Button>
      </div>
      <Card className="font-body bg-white/50 break-inside-avoid backdrop-blur-sm rounded-2xl border-none mb-6 relative transition-opacity">
        <CardHeader className="pb-3">
          <CardTitle className="text-3xl text-center">
            {type === 'study' ? 'School Day' : 'Work Day'}
          </CardTitle>
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
                    label={{
                      value: 'Hours',
                      angle: -90,
                      position: 'insideLeft',
                    }}
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
                  {/* Tooltip */}
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const entry = payload[0].payload;
                        return (
                          <div className="bg-white p-2 shadow-md rounded-md">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">
                                  Date
                                </span>
                                <span className="font-bold">
                                  {formatDate(entry.entry_date, true)}
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
      </Card>
    </div>
  );
}
