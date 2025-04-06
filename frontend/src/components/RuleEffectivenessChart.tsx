import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { RuleEffectiveness } from "types";

interface Props {
  effectiveness: RuleEffectiveness[];
}

interface ChartData {
  name: string;
  effectiveness: number;
  falsePositives: number;
  appeals: number;
}

export function RuleEffectivenessChart({ effectiveness }: Props) {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    // Transform effectiveness data for the chart
    const data = effectiveness.map((rule) => ({
      name: rule.rule_id.slice(0, 8), // Show first 8 chars of ID
      effectiveness: rule.effectiveness_score,
      falsePositives: (rule.false_positives / rule.total_matches) * 100,
      appeals: (rule.user_appeals / rule.total_matches) * 100,
    }));
    setChartData(data);
  }, [effectiveness]);

  return (
    <Card className="p-4 h-[400px]">
      <h3 className="font-semibold mb-4">Rule Effectiveness</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="effectiveness" name="Effectiveness" fill="var(--success-hex)" />
          <Bar dataKey="falsePositives" name="False Positives" fill="var(--warning-hex)" />
          <Bar dataKey="appeals" name="Appeals" fill="var(--info-hex)" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
