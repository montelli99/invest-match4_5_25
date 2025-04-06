import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LineKey {
  key: string;
  color: string;
  name?: string;
}

interface Props {
  data: Array<{ [key: string]: any }>;
  lineKeys: LineKey[];
  xAxisKey: string;
  height?: number;
  showLegend?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  xAxisFormatter?: (value: any) => string;
  yAxisFormatter?: (value: any) => string;
  tooltipFormatter?: (value: any) => string;
  animate?: boolean;
}

export const LineChartComponent = ({
  data,
  lineKeys,
  xAxisKey,
  height = 300,
  showLegend = true,
  isLoading = false,
  isError = false,
  xAxisFormatter,
  yAxisFormatter,
  tooltipFormatter,
  animate = true,
}: Props) => {
  if (isLoading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-[300px] w-full" />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-4 flex items-center justify-center h-[300px]">
        <div className="text-center">
          <p className="text-destructive">Failed to load chart data</p>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ height: `${height}px`, width: "100%" }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} tickFormatter={xAxisFormatter} />
          <YAxis tickFormatter={yAxisFormatter} />
          <Tooltip formatter={yAxisFormatter} labelFormatter={xAxisFormatter} />
          {showLegend && (
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => {
                const lineKey = lineKeys.find((k) => k.key === value);
                return lineKey?.name || value;
              }}
            />
          )}
          {lineKeys.map((lineKey) => (
            <Line
              key={lineKey.key}
              type="monotone"
              dataKey={lineKey.key}
              name={lineKey.name || lineKey.key}
              stroke={lineKey.color}
              strokeWidth={2}
              isAnimationActive={animate}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
