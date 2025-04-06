import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/card";

/**
 * Interface for moderator statistics
 */
export interface ModeratorStat {
  id: string;
  name: string;
  accuracyRate: number;
  responseTime: number;
  consistencyScore: number;
  totalActions: number;
}

interface ModeratorPerformanceSectionProps {
  moderatorStats: ModeratorStat[];
}

/**
 * ModeratorPerformanceSection Component - Displays performance metrics for moderators
 * 
 * This component encapsulates all the charts and tables related to moderator performance,
 * helping to keep the main dashboard component more manageable.
 */
export function ModeratorPerformanceSection({ moderatorStats }: ModeratorPerformanceSectionProps) {
  // Generate moderator performance data
  const moderatorPerformanceData = useMemo(() => {
    return moderatorStats.map(mod => ({
      name: mod.name,
      accuracy: mod.accuracyRate,
      responseTime: mod.responseTime,
      consistency: mod.consistencyScore
    }));
  }, [moderatorStats]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Response Time</CardTitle>
            <CardDescription>Average time to respond to reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moderatorStats} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Bar dataKey="responseTime" name="Response Time (s)" fill="var(--primary)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Accuracy Rate</CardTitle>
            <CardDescription>Decision accuracy per moderator</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moderatorStats} layout="vertical">
                  <XAxis type="number" domain={[70, 100]} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Bar dataKey="accuracyRate" name="Accuracy Rate (%)" fill="var(--destructive)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Actions</CardTitle>
            <CardDescription>Number of actions taken per moderator</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moderatorStats}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Bar dataKey="totalActions" name="Total Actions" fill="var(--primary)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Moderator Performance</CardTitle>
          <CardDescription>Detailed metrics for each moderator</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Moderator</TableHead>
                  <TableHead className="text-right">Response Time</TableHead>
                  <TableHead className="text-right">Accuracy Rate</TableHead>
                  <TableHead className="text-right">Consistency Score</TableHead>
                  <TableHead className="text-right">Total Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {moderatorStats.map((moderator) => (
                  <TableRow key={moderator.id}>
                    <TableCell className="font-medium">{moderator.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {moderator.responseTime}s
                        {moderator.responseTime < 40 ? (
                          <Badge variant="success" className="text-xs">Fast</Badge>
                        ) : moderator.responseTime > 50 ? (
                          <Badge variant="destructive" className="text-xs">Slow</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Average</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {moderator.accuracyRate}%
                        {moderator.accuracyRate > 90 ? (
                          <Badge variant="success" className="text-xs">Excellent</Badge>
                        ) : moderator.accuracyRate < 85 ? (
                          <Badge variant="destructive" className="text-xs">Needs Improvement</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Good</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {moderator.consistencyScore}%
                        {moderator.consistencyScore > 90 ? (
                          <Badge variant="success" className="text-xs">Excellent</Badge>
                        ) : moderator.consistencyScore < 85 ? (
                          <Badge variant="destructive" className="text-xs">Needs Improvement</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Good</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{moderator.totalActions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}