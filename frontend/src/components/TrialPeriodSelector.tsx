import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface Props {
  trialPeriods: number[];
  onSelect: (period: number) => void;
  className?: string;
}



export function TrialPeriodSelector({ trialPeriods, onSelect, className }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<number>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = async () => {
    if (!selectedPeriod) return;

    setIsLoading(true);
    try {
      await onSelect(selectedPeriod);
    } catch (err) {
      console.error('Trial selection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Select Trial Period</CardTitle>
        <CardDescription>
          Choose your preferred trial period to get started.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {trialPeriods.map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                onClick={() => setSelectedPeriod(period)}
                className="h-24"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{period}</div>
                  <div className="text-sm text-muted-foreground">
                    {period === 1 ? "Month" : "Months"}
                  </div>
                </div>
              </Button>
            ))}
          </div>

          <Button
            onClick={handleSelect}
            className="w-full"
            disabled={!selectedPeriod || isLoading}
          >
            {isLoading ? "Starting Trial..." : "Start Free Trial"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
