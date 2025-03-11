'use client';

import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

export interface DataPoint {
  entry_date: string;
  value: number;
}

export interface LineGraphProps {
  data: DataPoint[];
  title?: string;
  color?: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  tooltipLabel?: string;
  showGrid?: boolean;
  height?: number;
  valueFormatter?: (value: number) => string;
}

const CustomTooltip = ({ active, payload, label, valueFormatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <Card>
        <CardContent className="p-2">
          <p className="text-sm font-medium">
            {new Date(label).toLocaleDateString()}
          </p>
          <p className="text-sm text-muted-foreground">
            Value: {valueFormatter(payload[0].value)}
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default function LineGraph({
  data,
  title = 'Tracking Data',
  color = 'hsl(var(--primary))',
  yAxisLabel = 'Value',
  xAxisLabel = 'Date',
  tooltipLabel = 'Value',
  showGrid = true,
  height = 300,
  valueFormatter = (value: number) => `${value}`,
}: LineGraphProps) {
  return (
    <div className="w-full rounded-lg border bg-card p-4 shadow-sm">
      {title && <h3 className="mb-4 text-lg font-medium">{title}</h3>}
      <div className={`h-[${height}px]`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
            )}
            <XAxis
              dataKey="entry_date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              label={{
                value: yAxisLabel,
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle' },
              }}
            />
            <Tooltip
              content={<CustomTooltip valueFormatter={valueFormatter} />}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 4, fill: 'hsl(var(--background))', strokeWidth: 2 }}
              activeDot={{
                r: 6,
                fill: 'hsl(var(--background))',
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
