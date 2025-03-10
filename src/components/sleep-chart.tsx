'use client';
import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import {
  getLocalISOString,
  getSleepDuration,
  convertTo24Hour,
  formatHour,
  getBarColour,
  getTimeAMPM,
} from '@/lib/utils';
import { selectSleepDataByDateRange } from '@/actions/data-visualization';
import { SleepDataPoint, ProcessedSleepDataPoint } from '@/supabase/schema';

interface SleepChartProps {
  userId: string;
  title?: string;
}

export default function SleepChart({
  userId,
  title = 'Sleep Chart',
}: Readonly<SleepChartProps>) {
  const [sleepData, setSleepData] = useState<ProcessedSleepDataPoint[]>([]);

  const todaysDate = getLocalISOString();
  const lastMonthDate = getLocalISOString(
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
  );

  useEffect(() => {
    const fetchSleepData = async () => {
      // Fetch sleep data from the last month
      const response = await selectSleepDataByDateRange(
        userId,
        lastMonthDate,
        todaysDate,
      );
      if (
        Array.isArray(response.data) &&
        response.data.every(
          (item) => 'entry_date' in item && 'start' in item && 'end' in item,
        )
      ) {
        const sleepData = response.data as SleepDataPoint[];
        const processedData = sleepData.map((item) => {
          return {
            date: item.entry_date,
            start: item.start,
            end: item.end,
            start24Format: convertTo24Hour(item.start),
            sleepDuration: getSleepDuration(item.start, item.end),
          };
        });
        setSleepData(processedData);
      } else {
        console.error('Unexpected response data format', response.data);
      }
    };
    fetchSleepData();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      const startTime = getTimeAMPM(data.start);
      const endTime = getTimeAMPM(data.end);

      return (
        <div className="bg-white p-2 shadow-md rounded-md">
          <p className="text-sm font-semibold text-gray-800">{`${label}`}</p>
          <p className="text-sm text-gray-600">Start Time: {startTime}</p>
          <p className="text-sm text-gray-600">End Time: {endTime}</p>
        </div>
      );
    }
    return null;
  };

  const chartOptions = {
    margin: { top: 20, right: 20, left: 30, bottom: 20 },
    xAxis: {
      dataKey: 'date',
      tick: { fontSize: 12 },
      axisLine: true,
      tickLine: false,
    },
    yAxis: {
      type: 'number' as const,
      domain: [18, 42],
      tickFormatter: formatHour,
      allowDataOverflow: true,
      reversed: true,
      axisLine: true,
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
    <Card className="bg-white backdrop-blur-sm rounded-2xl border-none">
      <CardTitle className="text-2xl font-bold mb-2 opacity-50 text-center">
        {title}
      </CardTitle>
      <CardDescription className="text-center text-muted-foreground">
        from {lastMonthDate} to {todaysDate}
      </CardDescription>
      <CardContent>
        {sleepData.length === 0 ? (
          <div className="h-16 text-center">No data yet! :( </div>
        ) : (
          <ResponsiveContainer width="100%" height={600}>
            <BarChart data={sleepData} margin={chartOptions.margin}>
              <XAxis {...chartOptions.xAxis} />
              <YAxis {...chartOptions.yAxis} />
              <Tooltip content={<CustomTooltip />} />
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
        )}
      </CardContent>
    </Card>
  );
}
