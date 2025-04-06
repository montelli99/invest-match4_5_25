import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoCircledIcon } from "@radix-ui/react-icons";

import { Progress } from "@/components/ui/progress";

interface Props {
  metrics: {
    successful_introductions: number;
    total_introductions: number;
    avg_response_time: number | null;
    quality_score: number;
    interaction_frequency: number;
  };
}

export function RelationshipMetrics({ metrics }: Props) {
  const calculateSuccessRate = () => {
    if (metrics.total_introductions === 0) return 0;
    return (
      (metrics.successful_introductions / metrics.total_introductions) * 100
    );
  };

  const formatResponseTime = (hours: number | null) => {
    if (hours === null) return "N/A";
    if (hours < 1) return "< 1 hour";
    if (hours < 24) return `${Math.round(hours)} hours`;
    return `${Math.round(hours / 24)} days`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="transition-all hover:shadow-md hover:border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Overall quality score based on interaction history and feedback</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(metrics.quality_score)}%
          </div>
          <Progress value={metrics.quality_score} className="h-2 mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">Introduction Success Rate</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Percentage of successful introductions made through this relationship</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(calculateSuccessRate())}%
          </div>
          <div className="text-xs text-muted-foreground">
            {metrics.successful_introductions} of {metrics.total_introductions}{" "}
            successful
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Average time to respond to messages and introduction requests</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatResponseTime(metrics.avg_response_time)}
          </div>
          <div className="text-xs text-muted-foreground">
            {metrics.avg_response_time !== null
              ? "Based on all interactions"
              : "No data available"}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">Monthly Interactions</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Average number of meaningful interactions per month</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.interaction_frequency.toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground">
            Average interactions per month
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
