import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AreaKey {
  key: string;
  color: string;
  name?: string;
}

interface Props {
  data: Array<{ [key: string]: any }>;
  areaKeys: AreaKey[];
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

export const AreaChartComponent = ({
  data,
  areaKeys,
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
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xAxisKey}
            tickFormatter={xAxisFormatter}
            height={40}
          />
          <YAxis tickFormatter={yAxisFormatter} />
          <Tooltip
            formatter={tooltipFormatter || yAxisFormatter}
            labelFormatter={xAxisFormatter}
          />
          {showLegend && (
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => {
                const areaKey = areaKeys.find((k) => k.key === value);
                return areaKey?.name || value;
              }}
            />
          )}
          {areaKeys.map((areaKey) => (
            <Area
              key={areaKey.key}
              type="monotone"
              dataKey={areaKey.key}
              name={areaKey.name || areaKey.key}
              stroke={areaKey.color}
              fill={areaKey.color}
              fillOpacity={0.3}
              isAnimationActive={animate}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
