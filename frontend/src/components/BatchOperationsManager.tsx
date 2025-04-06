import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { ReportStatus, ReportType } from "../utils/enums";
import { ContentReport, RiskScore, RiskFactorWeight } from "../utils/moderationTypes";
import brain from "brain";
import {
  AlertCircle,
  ClipboardList,
  Play,
  Pause,
  Trash2,
  Check,
  X,
  Loader2,
  Filter,
  ArrowDownWideNarrow,
  RotateCw,
  AlertTriangle,
  ListFilter,
  Clock,
  Shield,
  CheckCircle2,
  Gauge,
  ChevronUpSquare,
  AlertOctagon
} from "lucide-react";

/**
 * Props for BatchOperationsManager component
 */
interface Props {
  token: { idToken: string };
  onBatchOperationComplete?: (stats: BatchOperationStats) => void;
}

/**
 * BatchOperationStats interface for tracking operation results
 */
interface BatchOperationStats {
  totalProcessed: number;
  successful: number;
  failed: number;
  skipped: number;
  operationType: string;
  timeElapsed: number;
}

/**
 * BatchOperation interface for task tracking
 */
interface BatchOperation {
  id: string;
  type: "review" | "delete" | "update_status" | "apply_template";
  status: "pending" | "in_progress" | "completed" | "failed" | "paused";
  progress: number;
  startTime?: Date;
  endTime?: Date;
  affectedItems: number;
  completedItems: number;
  failedItems: number;
  description: string;
  createdAt: Date;
  error?: string;
}

/**
 * BatchOperationItem interface for individual items in a batch
 */
interface BatchOperationItem {
  id: string;
  reportId: string;
  status: "pending" | "processing" | "success" | "error" | "skipped";
  retryCount: number;
  error?: string;
}

/**
 * BatchTaskPriority enum for task prioritization
 */
enum BatchTaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

/**
 * Rate limiting options interface
 */
interface RateLimitOptions {
  maxRequests: number;
  timeWindow: number; // milliseconds
  enabled: boolean;
}

/**
 * SimulatedReport generates a mock report for the demo
 */
const generateSimulatedReport = (id: number): ContentReport => {
  const reportTypes = [ReportType.message, ReportType.profile];
  const reasons = [
    "Inappropriate content",
    "Harassment",
    "Spam",
    "False information",
    "Violates terms of service"
  ];
  const riskScores = [25, 45, 65, 85, 95];
  
  const randomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };
  
  const created = randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date());
  const updated = new Date(created.getTime() + Math.random() * (Date.now() - created.getTime()));
  
  const reportTypeIndex = Math.floor(Math.random() * reportTypes.length);
  const reasonIndex = Math.floor(Math.random() * reasons.length);
  const riskScoreIndex = Math.floor(Math.random() * riskScores.length);
  
  return {
    id: `report-${id}`,
    type: reportTypes[reportTypeIndex],
    content_id: `content-${Math.floor(Math.random() * 1000)}`,
    reporter_id: `user-${Math.floor(Math.random() * 100)}`,
    reported_user_id: `user-${Math.floor(Math.random() * 100)}`,
    reason: reasons[reasonIndex],
    status: ReportStatus.pending,
    created_at: created.toISOString(),
    updated_at: updated.toISOString(),
    risk_score: riskScores[riskScoreIndex],
    risk_factors: [
      "content_severity",
      "user_history",
      riskScores[riskScoreIndex] > 70 ? "report_frequency" : undefined,
      riskScores[riskScoreIndex] > 80 ? "pattern_matches" : undefined
    ].filter(Boolean) as string[],
    pattern_matches: riskScores[riskScoreIndex] > 80 ? ["bad-word-1", "bad-word-2"] : [],
    false_positive: Math.random() > 0.9
  };
};

/**
 * BatchOperationsManager component - Handles batch operations for content moderation
 */
export function BatchOperationsManager({ token, onBatchOperationComplete }: Props) {
  // State for reports and selection
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  
  // Batch operation states
  const [operations, setOperations] = useState<BatchOperation[]>([]);
  const [activeOperation, setActiveOperation] = useState<BatchOperation | null>(null);
  const [operationItems, setOperationItems] = useState<BatchOperationItem[]>([]);
  
  // Filtering and sorting options
  const [riskThreshold, setRiskThreshold] = useState<number>(50); // Only process items above this risk score
  const [priorityFilter, setPriorityFilter] = useState<BatchTaskPriority | null>(null);
  const [sortBy, setSortBy] = useState<"risk" | "date" | "type">("risk");
  
  // Rate limiting options
  const [rateLimiting, setRateLimiting] = useState<RateLimitOptions>({
    maxRequests: 5,
    timeWindow: 1000, // 1 second
    enabled: true
  });
  
  // Performance tracking
  const [processingStats, setProcessingStats] = useState({
    averageProcessingTime: 120, // ms
    successRate: 98.5, // percent
    itemsPerSecond: 4.2
  });
  
  // Load reports (simulated for demo)
  useEffect(() => {
    const loadReports = async () => {
      setIsLoadingReports(true);
      
      try {
        // In a real implementation, this would fetch from an API
        // For demo purposes, we'll generate simulated reports
        setTimeout(() => {
          const simulatedReports = Array.from({ length: 20 }, (_, i) => 
            generateSimulatedReport(i + 1)
          );
          setReports(simulatedReports);
          setIsLoadingReports(false);
        }, 1000);
      } catch (error) {
        console.error("Error loading reports:", error);
        setIsLoadingReports(false);
        toast.error("Failed to load reports");
      }
    };
    
    loadReports();
  }, []);
  
  // Toggle a report's selection
  const toggleReportSelection = (reportId: string) => {
    setSelectedReports(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(reportId)) {
        newSelection.delete(reportId);
      } else {
        newSelection.add(reportId);
      }
      return newSelection;
    });
  };
  
  // Select/deselect all reports
  const toggleSelectAll = () => {
    if (selectedReports.size === filteredReports.length) {
      setSelectedReports(new Set());
    } else {
      setSelectedReports(new Set(filteredReports.map(report => report.id)));
    }
  };
  
  // Filter reports based on risk threshold and priority
  const filteredReports = reports.filter(report => {
    if (report.risk_score && report.risk_score < riskThreshold) {
      return false;
    }
    
    if (priorityFilter) {
      // Map risk score to priority
      const reportPriority = report.risk_score 
        ? (report.risk_score >= 80 
            ? BatchTaskPriority.CRITICAL
            : report.risk_score >= 60
              ? BatchTaskPriority.HIGH
              : report.risk_score >= 40
                ? BatchTaskPriority.MEDIUM
                : BatchTaskPriority.LOW)
        : BatchTaskPriority.LOW;
      
      if (reportPriority !== priorityFilter) {
        return false;
      }
    }
    
    return true;
  });
  
  // Sort the filtered reports
  const sortedReports = [...filteredReports].sort((a, b) => {
    switch (sortBy) {
      case "risk":
        return (b.risk_score || 0) - (a.risk_score || 0);
      case "date":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "type":
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });
  
  // Create and start a new batch operation
  const startBatchOperation = (type: "review" | "delete" | "update_status" | "apply_template") => {
    if (selectedReports.size === 0) {
      toast.warning("No reports selected");
      return;
    }
    
    const operationId = `operation-${Date.now()}`;
    const newOperation: BatchOperation = {
      id: operationId,
      type,
      status: "pending",
      progress: 0,
      startTime: new Date(),
      affectedItems: selectedReports.size,
      completedItems: 0,
      failedItems: 0,
      description: getOperationDescription(type),
      createdAt: new Date()
    };
    
    // Create operation items for each selected report
    const newOperationItems: BatchOperationItem[] = Array.from(selectedReports).map(reportId => ({
      id: `item-${reportId}-${Date.now()}`,
      reportId,
      status: "pending",
      retryCount: 0
    }));
    
    setOperations(prev => [newOperation, ...prev]);
    setOperationItems(newOperationItems);
    setActiveOperation(newOperation);
    
    // Start processing the batch
    processOperation(newOperation, newOperationItems);
    
    // Clear selection after starting the operation
    setSelectedReports(new Set());
  };
  
  // Get description for operation type
  const getOperationDescription = (type: string): string => {
    switch (type) {
      case "review":
        return `Review ${selectedReports.size} reports`;
      case "delete":
        return `Delete ${selectedReports.size} reports`;
      case "update_status":
        return `Update status for ${selectedReports.size} reports`;
      case "apply_template":
        return `Apply template to ${selectedReports.size} reports`;
      default:
        return `Process ${selectedReports.size} reports`;
    }
  };
  
  // Process a batch operation
  const processOperation = (operation: BatchOperation, items: BatchOperationItem[]) => {
    const updatedOperation = { ...operation, status: "in_progress" as const };
    setActiveOperation(updatedOperation);
    
    // Start a worker to process items with rate limiting
    let processedCount = 0;
    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    const startTime = Date.now();
    
    const processItem = async (item: BatchOperationItem, index: number) => {
      // Apply rate limiting if enabled
      if (rateLimiting.enabled && index > 0) {
        const delay = rateLimiting.timeWindow / rateLimiting.maxRequests;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      try {
        // Update item status to processing
        const updatedItems = [...items];
        updatedItems[index] = { ...item, status: "processing" };
        setOperationItems(updatedItems);
        
        // Simulate API call for the operation
        const report = reports.find(r => r.id === item.reportId);
        if (!report) {
          throw new Error("Report not found");
        }
        
        // Check if the report should be processed based on risk threshold
        if (report.risk_score && report.risk_score < riskThreshold) {
          // Skip low-risk items
          updatedItems[index] = { ...item, status: "skipped" };
          setOperationItems(updatedItems);
          processedCount++;
          skippedCount++;
        } else {
          // Simulate API call with variable processing time and occasional failures
          const processingTime = 500 + Math.random() * 1500; // Between 500ms and 2000ms
          const shouldFail = Math.random() < 0.05; // 5% failure rate
          
          await new Promise(resolve => setTimeout(resolve, processingTime));
          
          if (shouldFail && item.retryCount >= 2) {
            // Fail after 2 retries
            throw new Error(`Failed to process report ${item.reportId}`);
          } else if (shouldFail) {
            // Retry
            updatedItems[index] = { 
              ...item, 
              status: "pending", 
              retryCount: item.retryCount + 1,
              error: "Temporary error, retrying..."
            };
            setOperationItems(updatedItems);
            
            // Retry after a delay
            setTimeout(() => processItem(updatedItems[index], index), 2000);
            return;
          }
          
          // Success
          updatedItems[index] = { ...item, status: "success" };
          setOperationItems(updatedItems);
          processedCount++;
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing item ${item.reportId}:`, error);
        
        // Update item status to error
        const updatedItems = [...items];
        updatedItems[index] = { 
          ...item, 
          status: "error", 
          error: error instanceof Error ? error.message : "Unknown error" 
        };
        setOperationItems(updatedItems);
        processedCount++;
        failedCount++;
      }
      
      // Update operation progress
      const progress = (processedCount / items.length) * 100;
      const updatedOp = { 
        ...updatedOperation, 
        progress, 
        completedItems: successCount,
        failedItems: failedCount
      };
      
      if (processedCount === items.length) {
        // Operation complete
        updatedOp.status = "completed";
        updatedOp.endTime = new Date();
        setActiveOperation(updatedOp);
        
        // Update operations list
        setOperations(prev => 
          prev.map(op => op.id === updatedOp.id ? updatedOp : op)
        );
        
        const timeElapsed = (Date.now() - startTime) / 1000; // in seconds
        
        // Calculate processing stats
        setProcessingStats({
          averageProcessingTime: timeElapsed * 1000 / items.length,
          successRate: (successCount / items.length) * 100,
          itemsPerSecond: items.length / timeElapsed
        });
        
        // Notify parent of completion
        if (onBatchOperationComplete) {
          onBatchOperationComplete({
            totalProcessed: items.length,
            successful: successCount,
            failed: failedCount,
            skipped: skippedCount,
            operationType: operation.type,
            timeElapsed
          });
        }
        
        toast.success(`Batch operation completed: ${successCount} successful, ${failedCount} failed, ${skippedCount} skipped`);
      } else {
        // Update in-progress operation
        setActiveOperation(updatedOp);
      }
    };
    
    // Start processing all items
    items.forEach((item, index) => {
      setTimeout(() => processItem(item, index), index * (1000 / rateLimiting.maxRequests));
    });
  };
  
  // Pause or resume an operation
  const toggleOperationStatus = (operation: BatchOperation) => {
    if (operation.status === "in_progress") {
      const updatedOperation = { ...operation, status: "paused" as const };
      setOperations(prev => 
        prev.map(op => op.id === operation.id ? updatedOperation : op)
      );
      setActiveOperation(updatedOperation);
      toast.info("Operation paused");
    } else if (operation.status === "paused") {
      const updatedOperation = { ...operation, status: "in_progress" as const };
      setOperations(prev => 
        prev.map(op => op.id === operation.id ? updatedOperation : op)
      );
      setActiveOperation(updatedOperation);
      
      // Resume processing
      const pendingItems = operationItems.filter(
        item => item.status === "pending" || item.status === "error"
      );
      processOperation(updatedOperation, pendingItems);
      toast.info("Operation resumed");
    }
  };
  
  // Cancel an operation
  const cancelOperation = (operation: BatchOperation) => {
    const updatedOperation = { ...operation, status: "failed" as const, error: "Cancelled by user" };
    setOperations(prev => 
      prev.map(op => op.id === operation.id ? updatedOperation : op)
    );
    setActiveOperation(null);
    toast.info("Operation cancelled");
  };
  
  // Get a badge for report risk level
  const getRiskBadge = (riskScore?: number) => {
    if (!riskScore) return <Badge variant="outline">Unknown</Badge>;
    
    if (riskScore >= 80) {
      return <Badge variant="destructive">Critical</Badge>;
    } else if (riskScore >= 60) {
      return <Badge variant="destructive" className="bg-orange-500">High</Badge>;
    } else if (riskScore >= 40) {
      return <Badge variant="warning">Medium</Badge>;
    } else {
      return <Badge variant="secondary">Low</Badge>;
    }
  };
  
  // Get a badge for operation status
  const getOperationStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "in_progress":
        return <Badge variant="warning" className="animate-pulse">In Progress</Badge>;
      case "completed":
        return <Badge variant="success" className="bg-green-500">Completed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "paused":
        return <Badge variant="secondary">Paused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Calculate batch operation efficiency
  const getEfficiencyStats = () => {
    const completedOperations = operations.filter(
      op => op.status === "completed"
    );
    
    if (completedOperations.length === 0) {
      return {
        successRate: 0,
        averageTime: 0,
        itemsPerSecond: 0
      };
    }
    
    const totalItems = completedOperations.reduce(
      (sum, op) => sum + op.affectedItems, 0
    );
    const successfulItems = completedOperations.reduce(
      (sum, op) => sum + op.completedItems, 0
    );
    const failedItems = completedOperations.reduce(
      (sum, op) => sum + op.failedItems, 0
    );
    
    const successRate = (successfulItems / totalItems) * 100;
    
    const totalTimeMS = completedOperations.reduce((sum, op) => {
      if (op.startTime && op.endTime) {
        return sum + (op.endTime.getTime() - op.startTime.getTime());
      }
      return sum;
    }, 0);
    
    const averageTime = totalTimeMS / completedOperations.length / 1000; // seconds
    const itemsPerSecond = totalItems / (totalTimeMS / 1000);
    
    return { successRate, averageTime, itemsPerSecond };
  };
  
  const efficiency = getEfficiencyStats();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Batch Operations Manager</CardTitle>
        <CardDescription>
          Efficiently process and manage moderation tasks in batches
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="queue" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="queue" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Content Queue
            </TabsTrigger>
            <TabsTrigger value="operations" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Active Operations
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>
          
          {/* Queue Tab */}
          <TabsContent value="queue">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Content Reports ({filteredReports.length})</h3>
                  {isLoadingReports && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="risk">Sort by Risk</SelectItem>
                      <SelectItem value="date">Sort by Date</SelectItem>
                      <SelectItem value="type">Sort by Type</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="icon" onClick={() => {
                    setReports([]);
                    setIsLoadingReports(true);
                    setTimeout(() => {
                      const simulatedReports = Array.from({ length: 20 }, (_, i) => 
                        generateSimulatedReport(i + 1)
                      );
                      setReports(simulatedReports);
                      setIsLoadingReports(false);
                    }, 1000);
                  }}>
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Filters */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters & Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="risk-threshold">Risk Threshold ({riskThreshold})</Label>
                          <span className="text-sm text-muted-foreground">
                            Only process items above this risk level
                          </span>
                        </div>
                        <Slider
                          id="risk-threshold"
                          value={[riskThreshold]}
                          min={0}
                          max={100}
                          step={5}
                          onValueChange={([value]) => setRiskThreshold(value)}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Low Risk</span>
                          <span>Medium Risk</span>
                          <span>High Risk</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Priority Filter</Label>
                        <Select
                          value={priorityFilter || ""}
                          onValueChange={(value) => setPriorityFilter(value ? value as BatchTaskPriority : null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Priorities" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value={BatchTaskPriority.CRITICAL}>Critical</SelectItem>
                            <SelectItem value={BatchTaskPriority.HIGH}>High</SelectItem>
                            <SelectItem value={BatchTaskPriority.MEDIUM}>Medium</SelectItem>
                            <SelectItem value={BatchTaskPriority.LOW}>Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Rate Limiting</Label>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="enable-rate-limiting"
                            checked={rateLimiting.enabled}
                            onCheckedChange={(checked) => 
                              setRateLimiting(prev => ({ ...prev, enabled: !!checked }))
                            }
                          />
                          <Label htmlFor="enable-rate-limiting">Enable Rate Limiting</Label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="max-requests">Max Requests</Label>
                            <Input
                              id="max-requests"
                              type="number"
                              value={rateLimiting.maxRequests}
                              onChange={(e) => setRateLimiting(prev => ({
                                ...prev,
                                maxRequests: Math.max(1, parseInt(e.target.value) || 1)
                              }))}
                              min={1}
                              disabled={!rateLimiting.enabled}
                            />
                          </div>
                          <div>
                            <Label htmlFor="time-window">Time Window (ms)</Label>
                            <Input
                              id="time-window"
                              type="number"
                              value={rateLimiting.timeWindow}
                              onChange={(e) => setRateLimiting(prev => ({
                                ...prev,
                                timeWindow: Math.max(100, parseInt(e.target.value) || 1000)
                              }))}
                              min={100}
                              step={100}
                              disabled={!rateLimiting.enabled}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Batch Actions */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Batch Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Selected Reports: {selectedReports.size}</Label>
                        <Progress value={(selectedReports.size / filteredReports.length) * 100} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          disabled={selectedReports.size === 0}
                          onClick={() => startBatchOperation("review")}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Review Selected
                        </Button>
                        <Button
                          variant="outline"
                          disabled={selectedReports.size === 0}
                          onClick={() => startBatchOperation("update_status")}
                        >
                          <ChevronUpSquare className="h-4 w-4 mr-2" />
                          Update Status
                        </Button>
                        <Button
                          variant="outline"
                          disabled={selectedReports.size === 0}
                          onClick={() => startBatchOperation("apply_template")}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Apply Template
                        </Button>
                        <Button
                          variant="destructive"
                          disabled={selectedReports.size === 0}
                          onClick={() => startBatchOperation("delete")}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Selected
                        </Button>
                      </div>
                      
                      <div className="pt-2">
                        <Alert variant="outline">
                          <ListFilter className="h-4 w-4" />
                          <AlertTitle>Batch Processing Tips</AlertTitle>
                          <AlertDescription>
                            <ul className="list-disc pl-4 text-sm">
                              <li>Use filters to focus on high-risk content first</li>
                              <li>Enable rate limiting to prevent API throttling</li>
                              <li>Operations can be paused and resumed if needed</li>
                              <li>Failed items can be automatically retried</li>
                            </ul>
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Reports Table */}
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/10 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={selectedReports.size === filteredReports.length && filteredReports.length > 0}
                              onCheckedChange={toggleSelectAll}
                            />
                            <span>ID</span>
                          </div>
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Reason</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Risk</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedReports.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="h-24 text-center">
                            {isLoadingReports ? (
                              <div className="flex justify-center items-center">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                Loading reports...
                              </div>
                            ) : (
                              <div className="text-muted-foreground">
                                No reports match your filters
                              </div>
                            )}
                          </td>
                        </tr>
                      ) : (
                        sortedReports.map((report) => (
                          <tr 
                            key={report.id} 
                            className={`border-b transition-colors hover:bg-muted/50 ${selectedReports.has(report.id) ? "bg-muted/20" : ""}`}
                            onClick={() => toggleReportSelection(report.id)}
                          >
                            <td className="p-4 align-middle">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={selectedReports.has(report.id)}
                                  onCheckedChange={() => toggleReportSelection(report.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="font-mono text-xs">{report.id}</span>
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <Badge variant="outline">{report.type}</Badge>
                            </td>
                            <td className="p-4 align-middle">
                              <span className="line-clamp-1 max-w-[200px]">{report.reason}</span>
                            </td>
                            <td className="p-4 align-middle">
                              {getRiskBadge(report.risk_score)}
                            </td>
                            <td className="p-4 align-middle">
                              <Badge variant="outline">{report.status}</Badge>
                            </td>
                            <td className="p-4 align-middle">
                              <span className="text-xs text-muted-foreground">
                                {new Date(report.created_at).toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Operations Tab */}
          <TabsContent value="operations">
            <div className="space-y-4">
              {/* Active Operation */}
              {activeOperation && (
                <Card className="border-2 border-primary/20">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Play className="h-5 w-5 text-primary" />
                        Active Operation
                      </CardTitle>
                      {getOperationStatusBadge(activeOperation.status)}
                    </div>
                    <CardDescription>
                      {activeOperation.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>Progress ({Math.round(activeOperation.progress)}%)</Label>
                          <span className="text-sm">
                            {activeOperation.completedItems + activeOperation.failedItems} of {activeOperation.affectedItems} processed
                          </span>
                        </div>
                        <Progress value={activeOperation.progress} className="h-3" />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Started</div>
                          <div className="text-sm">
                            {activeOperation.startTime?.toLocaleString() || "Not started"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Success / Fail</div>
                          <div className="text-sm flex items-center gap-2">
                            <Badge variant="success" className="bg-green-500">{activeOperation.completedItems}</Badge>
                            <span>/</span>
                            <Badge variant="destructive">{activeOperation.failedItems}</Badge>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Estimated Time</div>
                          <div className="text-sm">
                            {activeOperation.status === "completed" 
                              ? "Completed" 
                              : `${Math.ceil((activeOperation.affectedItems - activeOperation.completedItems - activeOperation.failedItems) / 5)} seconds left`}
                          </div>
                        </div>
                      </div>
                      
                      {activeOperation.error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>
                            {activeOperation.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {activeOperation.status === "completed" || activeOperation.status === "failed" ? (
                      <Button variant="outline" size="sm" onClick={() => setActiveOperation(null)}>
                        <Check className="h-4 w-4 mr-2" />
                        Dismiss
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleOperationStatus(activeOperation)}
                      >
                        {activeOperation.status === "in_progress" ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Resume
                          </>
                        )}
                      </Button>
                    )}
                    
                    {activeOperation.status !== "completed" && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => cancelOperation(activeOperation)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )}
              
              {/* Operation Items */}
              {activeOperation && operationItems.length > 0 && (
                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto max-h-[300px]">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b sticky top-0 bg-background">
                        <tr className="border-b transition-colors hover:bg-muted/10 data-[state=selected]:bg-muted">
                          <th className="h-12 px-4 text-left align-middle font-medium">Report ID</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Retries</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {operationItems.map((item) => (
                          <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle">
                              <span className="font-mono text-xs">{item.reportId}</span>
                            </td>
                            <td className="p-4 align-middle">
                              {item.status === "pending" && (
                                <Badge variant="outline">Pending</Badge>
                              )}
                              {item.status === "processing" && (
                                <Badge variant="warning" className="animate-pulse">Processing</Badge>
                              )}
                              {item.status === "success" && (
                                <Badge variant="success" className="bg-green-500">Success</Badge>
                              )}
                              {item.status === "error" && (
                                <Badge variant="destructive">Error</Badge>
                              )}
                              {item.status === "skipped" && (
                                <Badge variant="secondary">Skipped</Badge>
                              )}
                            </td>
                            <td className="p-4 align-middle">
                              {item.retryCount > 0 ? (
                                <Badge variant="outline">{item.retryCount}</Badge>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </td>
                            <td className="p-4 align-middle">
                              {item.error ? (
                                <span className="text-xs text-destructive">{item.error}</span>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Operation History */}
              <div className="space-y-4">
                <h3 className="font-medium">Operation History</h3>
                
                {operations.filter(op => op.id !== activeOperation?.id).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No historical operations found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {operations
                      .filter(op => op.id !== activeOperation?.id)
                      .slice(0, 5)
                      .map((operation) => (
                        <Card key={operation.id}>
                          <CardHeader className="py-2">
                            <div className="flex justify-between items-center">
                              <div className="font-medium">{operation.description}</div>
                              {getOperationStatusBadge(operation.status)}
                            </div>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="grid grid-cols-4 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Items:</span>{" "}
                                {operation.affectedItems}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Success:</span>{" "}
                                {operation.completedItems}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Failed:</span>{" "}
                                {operation.failedItems}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Date:</span>{" "}
                                {operation.createdAt.toLocaleDateString()}
                              </div>
                            </div>
                            
                            {operation.error && (
                              <div className="mt-2 text-xs text-destructive">
                                Error: {operation.error}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Performance Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Success Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">
                      {efficiency.successRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Operations completed successfully
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Average Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">
                      {efficiency.averageTime.toFixed(2)}s
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Average operation duration
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-primary" />
                      Throughput
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">
                      {efficiency.itemsPerSecond.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Items processed per second
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>System Optimizations</CardTitle>
                  <CardDescription>
                    Performance tuning options for batch operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="batch-size">Batch Size</Label>
                        <Input
                          id="batch-size"
                          type="number"
                          defaultValue="25"
                          min="1"
                          max="100"
                        />
                        <div className="text-xs text-muted-foreground">
                          Maximum number of items processed per batch
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="retry-attempts">Retry Attempts</Label>
                        <Input
                          id="retry-attempts"
                          type="number"
                          defaultValue="3"
                          min="0"
                          max="10"
                        />
                        <div className="text-xs text-muted-foreground">
                          Number of retry attempts for failed operations
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="concurrency">Concurrency Level</Label>
                        <Input
                          id="concurrency"
                          type="number"
                          defaultValue="5"
                          min="1"
                          max="20"
                        />
                        <div className="text-xs text-muted-foreground">
                          Number of parallel operations
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="timeout">Operation Timeout (ms)</Label>
                        <Input
                          id="timeout"
                          type="number"
                          defaultValue="10000"
                          min="1000"
                          step="1000"
                        />
                        <div className="text-xs text-muted-foreground">
                          Maximum time before an operation times out
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Background Processing</Label>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="background-processing" defaultChecked />
                          <Label htmlFor="background-processing">Enabled</Label>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Process operations in the background even when the dashboard is not visible
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Error Recovery</Label>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="auto-recovery" defaultChecked />
                          <Label htmlFor="auto-recovery">Auto Recovery</Label>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Automatically recover from transient errors and retry operations
                      </div>
                    </div>
                    
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Performance Advisory</AlertTitle>
                      <AlertDescription>
                        High concurrency levels may lead to API rate limiting. Adjust the rate limiting settings accordingly to optimize throughput while maintaining system stability.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Real-time processing performance data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Average Processing Time</div>
                        <div className="text-xl font-semibold">{processingStats.averageProcessingTime.toFixed(1)}ms</div>
                        <Progress value={Math.min(100, (processingStats.averageProcessingTime / 500) * 100)} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Processing Success Rate</div>
                        <div className="text-xl font-semibold">{processingStats.successRate.toFixed(1)}%</div>
                        <Progress value={processingStats.successRate} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Items Per Second</div>
                        <div className="text-xl font-semibold">{processingStats.itemsPerSecond.toFixed(1)}</div>
                        <Progress value={Math.min(100, (processingStats.itemsPerSecond / 10) * 100)} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="bg-muted rounded-md p-4">
                      <h4 className="font-medium mb-2">System Recommendations</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <AlertOctagon className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>Consider enabling background processing for large batch operations to improve UI responsiveness.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertOctagon className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>Reduce batch size to improve success rate if processing large amounts of data.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertOctagon className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>Enable rate limiting to prevent API throttling during high-volume operations.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" disabled={selectedReports.size === 0} onClick={() => setSelectedReports(new Set())}>
          Clear Selection ({selectedReports.size})
        </Button>
        <Button variant="default" size="sm" disabled={activeOperation !== null}>
          Save Settings
        </Button>
      </CardFooter>
    </Card>
  );
}
