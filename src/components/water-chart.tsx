'use client';

import { useState, useEffect } from 'react';
import LineGraph, { type DataPoint } from '@/components/line-graph';
import { selectWaterDataByDateRange } from '@/actions/data-visualization';
import { getLocalISOString } from '@/lib/utils';

interface WaterChartProps {
  userId: string;
}

export default function WaterChart({ userId }: Readonly<WaterChartProps>) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const todaysDate = getLocalISOString();
  const lastMonthDate = getLocalISOString(
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
  );
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await selectWaterDataByDateRange(
        userId,
        lastMonthDate,
        todaysDate,
      );

      console.log(response);

      if (
        Array.isArray(response.data) &&
        response.data.every(
          (item: any) => 'entry_date' in item && 'water' in item,
        )
      ) {
        const filteredData: DataPoint[] = response.data
          .map((item: any) => ({
            entry_date: item.entry_date,
            value: item.water, // Map 'water' to 'value'
          }))
          .filter((item: DataPoint) => item.value !== null); // Filter out null values

        setData(filteredData);
        setLoading(false);
      } else {
        console.error('Unexpected response data format', response.data);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-8">
      {loading ? (
        <div className="flex h-[300px] items-center justify-center rounded-lg border bg-card">
          <p>Loading data...</p>
        </div>
      ) : data.length > 0 ? (
        <LineGraph
          data={data}
          title="Water Intake History"
          yAxisLabel="Cups of Water"
          tooltipLabel="Cups of Water"
          color="hsl(215, 70%, 60%)"
        />
      ) : (
        <div className="flex h-[300px] items-center justify-center rounded-lg border bg-card">
          <p>No data available for the selected period.</p>
        </div>
      )}
    </div>
  );
}
