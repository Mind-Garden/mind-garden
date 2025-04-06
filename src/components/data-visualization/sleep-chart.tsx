'use client';
import { Frown } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { selectSleepDataByDateRange } from '@/actions/data-visualization';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/card';
import {
  convertTo24Hour,
  formatHour,
  getBarColour,
  getLocalISOString,
  getSleepDuration,
  getTimeAMPM,
} from '@/lib/utils';
import { ProcessedSleepDataPoint, SleepDataPoint } from '@/supabase/schema';

type TimeRange = 'week' | 'month' | '3months';

interface SleepChartProps {
  userId: string;
  title?: string;
  range?: TimeRange;
}

export default function SleepChart({
  userId,
  title = 'Sleep Chart',
  range = 'week',
}: Readonly<SleepChartProps>) {
  const [sleepData, setSleepData] = useState<ProcessedSleepDataPoint[]>([]);

  const todaysDate = getLocalISOString();
  let startDate = getLocalISOString();

  const calculateDuration = (startTime: string, endTime: string) => {
    const parseTime = (timeStr: string) => {
      const [time, period] = timeStr.split(' ');
      const [hoursStr, minutes] = time.split(':').map(Number);

      let hours = hoursStr;

      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      return hours * 60 + minutes;
    };

    const start = parseTime(startTime);
    let end = parseTime(endTime);

    // Handle overnight sleep
    if (end < start) end += 24 * 60;

    const durationMinutes = end - start;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    const fetchSleepData = async () => {
      // get the correct start date according to time range
      const today = new Date();
      if (range === 'week') {
        startDate = getLocalISOString(
          new Date(today.setDate(today.getDate() - 7)),
        );
      } else if (range === 'month') {
        startDate = getLocalISOString(
          new Date(today.setMonth(today.getMonth() - 1)),
        );
      } else if (range === '3months') {
        startDate = getLocalISOString(
          new Date(today.setMonth(today.getMonth() - 3)),
        );
      }

      // Fetch sleep data from the last month
      const response = await selectSleepDataByDateRange(
        userId,
        startDate,
        todaysDate,
      );
      if (
        Array.isArray(response.data) &&
        response.data.every(
          (item) => 'entry_date' in item && 'start' in item && 'end' in item,
        )
      ) {
        const sleepData = response.data as SleepDataPoint[];
        const processedData = sleepData
          .map((item) => {
            return {
              date: item.entry_date,
              start: item.start,
              end: item.end,
              start24Format: convertTo24Hour(item.start),
              sleepDuration: getSleepDuration(item.start, item.end),
            };
          })
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          );
        setSleepData(processedData);
      } else {
        console.error('Unexpected response data format', response.data);
      }
    };
    fetchSleepData();
  }, [userId, range]);

  // formate date to month, day, year format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString + 'T00:00:00Z');
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      });
    } catch (e) {
      return dateString;
    }
  };

  // custom tooltip for the sleep chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      const startTime = getTimeAMPM(data.start);
      const endTime = getTimeAMPM(data.end);

      return (
        <div className="bg-white p-2 shadow-md rounded-md">
          <p className="text-sm font-semibold text-gray-800">
            {label ? formatDate(label) : ''}
          </p>
          <p className="text-sm text-gray-600">Start Time: {startTime}</p>
          <p className="text-sm text-gray-600">End Time: {endTime}</p>
        </div>
      );
    }
    return null;
  };

  // custom cursor for sleep chart (verticle line cursor)
  const CustomCursor = (props: any) => {
    const { x, y, width, height, stroke } = props;

    if (!x || !y) return null;

    const centerX = x + width / 2;

    return (
      <line
        x1={centerX}
        y1={y}
        x2={centerX}
        y2={y + height}
        stroke="#d9d9d9"
        strokeWidth={1}
      />
    );
  };

  const chartOptions = {
    margin: { top: 20, right: 20, left: 30, bottom: 20 },
    xAxis: {
      dataKey: 'date',
      tick: { fontSize: 12 },
      axisLine: false,
      tickLine: false,
    },
    yAxis: {
      type: 'number' as const,
      domain: [18, 42],
      tickFormatter: formatHour,
      allowDataOverflow: true,
      reversed: true,
      axisLine: false,
      tickLine: false,
    },
    barStyles: {
      start: {
        dataKey: 'start24Format',
        stackId: 'a',
        fill: 'transparent',
      },
      sleepDuration: {
        dataKey: 'sleepDuration',
        stackId: 'a',
        fill: '#ff8c8c',
        radius: [10, 10, 10, 10] as [number, number, number, number],
      },
    },
  };

  return (
    <Card className="bg-white/50 break-inside-avoid backdrop-blur-sm rounded-2xl border-none mb-6 relative transition-opacity">
      <CardHeader className="pb-3">
        <CardTitle className="text-3xl text-center">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        {sleepData.length === 0 ? (
          <div className="h-16 flex items-center justify-center text-center gap-2 text-muted-foreground">
            <span>No data found.</span>
            <Frown className="w-5 h-5" />
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={600}>
              <BarChart data={sleepData} margin={chartOptions.margin}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis {...chartOptions.xAxis} />
                <YAxis {...chartOptions.yAxis} />
                <Tooltip
                  cursor={<CustomCursor />}
                  content={<CustomTooltip />}
                />
                <Bar {...chartOptions.barStyles.start} />
                <Bar {...chartOptions.barStyles.sleepDuration}>
                  {sleepData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColour(entry.sleepDuration)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex justify-center mt-4 gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: '#2ebb61' }}
                ></span>
                <span>Long Sleep</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: '#83e3c6' }}
                ></span>
                <span>Normal Sleep </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: '#d1d5db' }}
                ></span>
                <span>Short Sleep </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
