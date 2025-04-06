import { useState, useCallback, useEffect } from "react";
import { useWebSocket } from "utils/useWebSocket";
import { toast } from "sonner";
import { DataTable } from "components/DataTable";
import { useAdminStore } from "utils/adminStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  status?: "pending" | "reviewed" | "resolved";
}

export function ModerationTable({ status }: Props) {
  const { reports, isLoading, error, updateReport, fetchReports, addReport, updateReportInList } = useAdminStore();
  // Selected reports state for batch operations
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const navigate = useNavigate();
  
  // Handle row selection for batch operations
  const handleRowSelect = (rowId: string, selected: boolean) => {
    if (selected) {
      setSelectedReports(prev => [...prev, rowId]);
    } else {
      setSelectedReports(prev => prev.filter(id => id !== rowId));
    }
  };
  
  // Handle select all rows
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedReports(reports.map(report => report.id));
    } else {
      setSelectedReports([]);
    }
  };

  // Redirect to enhanced dashboard
  const handleRedirectToEnhanced = () => {
    // Navigate to the admin dashboard with the enhanced-moderation tab active
    navigate('/admin', { state: { activeTab: 'enhanced-moderation' } });
    
    // Show toast to explain the redirection
    toast.success("Redirected to Enhanced Dashboard", {
      description: "You're now using the comprehensive moderation system with advanced features."
    });
  };

  useEffect(() => {
    fetchReports(status);
  }, [fetchReports, status]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ total: 0, completed: 0, success: 0 });
  const [retryCount, setRetryCount] = useState<Record<string, number>>({});
  const MAX_RETRIES = 3;
  const BATCH_SIZE = 5;
  const [failedReports, setFailedReports] = useState<string[]>([]);
  const [updateError, setUpdateError] = useState<string | null>(null);
  // Use sonner toast directly

  const handleWebSocketMessage = useCallback(
    (message: { type: string; payload: any }) => {
      if (message.type === "report_update") {
        // Update the report in the list
        const updatedReport = message.payload;
        updateReportInList(updatedReport);

        toast.success("Report Updated", {
          description: `Report ${updatedReport.id} has been ${updatedReport.status}`
        });
      } else if (message.type === "new_report") {
        // Add new report to the list if it matches the current filter
        const newReport = message.payload;
        if (!status || newReport.status === status) {
          addReport(newReport);
          toast.info("New Report", {
            description: "A new content report has been received"
          });
        }
      }
    },
    [reports, status, toast]
  );

  const { isConnected } = useWebSocket("/ws/admin/moderation", {
    onMessage: handleWebSocketMessage,
    onError: () => {
      toast.error("Connection Error", {
        description: "Failed to connect to real-time updates"
      });
    },
  });

  const handleBatchAction = async (action: "approve" | "reject") => {
    if (!selectedReports.length || !reviewNotes.trim()) return;

    setIsBatchProcessing(true);
    setUpdateError(null);
    setBatchProgress({ total: selectedReports.length, completed: 0, success: 0 });
    setFailedReports([]);

    // Process reports in smaller batches to avoid overwhelming the server
    const batches = [];
    for (let i = 0; i < selectedReports.length; i += BATCH_SIZE) {
      batches.push(selectedReports.slice(i, i + BATCH_SIZE));
    }

    // Process each batch sequentially with retries
    for (const batch of batches) {
      const processBatchWithRetry = async (reportId: string) => {
        const currentRetries = retryCount[reportId] || 0;

        try {
          const success = await updateReport(
            reportId,
            action === "approve" ? "resolved" : "reviewed",
            reviewNotes
          );

          if (success) {
            setBatchProgress(prev => ({
              ...prev,
              completed: prev.completed + 1,
              success: prev.success + 1
            }));
            // Reset retry count on success
            setRetryCount(prev => ({ ...prev, [reportId]: 0 }));
            return true;
          }
          throw new Error("Update failed");
        } catch (error) {
          if (currentRetries < MAX_RETRIES) {
            // Increment retry count
            setRetryCount(prev => ({ ...prev, [reportId]: currentRetries + 1 }));
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => 
              setTimeout(resolve, Math.pow(2, currentRetries) * 1000)
            );
            return processBatchWithRetry(reportId);
          }

          setFailedReports(prev => [...prev, reportId]);
          setBatchProgress(prev => ({
            ...prev,
            completed: prev.completed + 1
          }));
          return false;
        }
      };

      // Process current batch
      const results = await Promise.allSettled(
        batch.map(reportId => processBatchWithRetry(reportId))
      );

    }

    const allSuccessful = batchProgress.success === selectedReports.length;

    if (allSuccessful) {
      setSelectedReports([]);
      setReviewNotes("");
      toast.success("Success", {
        description: `Successfully ${action}ed ${selectedReports.length} reports`
      });
    } else {
      setUpdateError("Failed to update some reports");
      toast.error("Error", {
        description: "Failed to update some reports"
      });
    }

    setIsBatchProcessing(false);
  };

  const handleAction = async (action: "approve" | "reject") => {
    if (!selectedReport || !reviewNotes.trim()) return;

    setIsUpdating(true);
    setUpdateError(null);

    const success = await updateReport(
      selectedReport.id,
      action === "approve" ? "resolved" : "reviewed",
      reviewNotes
    );

    if (success) {
      setSelectedReport(null);
      setReviewNotes("");
    } else {
      setUpdateError("Failed to update report");
    }

    setIsUpdating(false);
  };

  const columns = [
    { key: "type", label: "Type" },
    { key: "content", label: "Content" },
    {
      key: "timestamp",
      label: "Reported",
      render: (value: string) => new Date(value).toLocaleString(),
    },
    { key: "severity", label: "Severity" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge
          variant={value === "pending" ? "warning" : value === "resolved" ? "success" : "destructive"}
        >
          {value}
        </Badge>
      ),
    },
  ];

  const actions = [
    {
      label: "Review",
      onClick: (row: any) => setSelectedReport(row),
      variant: "outline" as const,
    },
  ];

  return (
    <div className="space-y-4">
      <Alert className="mb-4 bg-amber-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Enhanced Moderation Dashboard Available</p>
            <p>This legacy interface has been fully replaced with a comprehensive moderation system that includes:</p>
            <ul className="list-disc list-inside mt-1 text-sm">
              <li>Advanced rule effectiveness metrics and pattern testing</li>
              <li>Batch operations for efficient moderation</li>
              <li>Risk scoring with severity analysis</li>
              <li>Appeal management and trusted user program</li>
              <li>Real-time WebSocket notifications</li>
            </ul>
          </div>
          <Button variant="default" size="sm" onClick={handleRedirectToEnhanced}>
            Open Enhanced Dashboard
          </Button>
        </AlertDescription>
      </Alert>
      
      {isConnected && (
        <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
          <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400" />
          <span>Real-time updates active</span>
        </div>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        {isBatchProcessing && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center rounded-lg z-10">
            <div className="bg-background p-4 rounded-lg shadow-lg space-y-2">
              <div className="text-sm font-medium">
                Processing {batchProgress.completed} of {batchProgress.total}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                Successfully processed: {batchProgress.success}
              </div>
              {failedReports.length > 0 && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  Failed: {failedReports.length}
                  {retryCount[failedReports[0]] > 0 && (
                    <span className="ml-2">
                      (Retry {retryCount[failedReports[0]]}/{MAX_RETRIES})
                    </span>
                  )}
                </div>
              )}
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${(batchProgress.completed / batchProgress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <DataTable
          columns={columns}
          data={reports}
          actions={actions}
          isLoading={isLoading}
          searchable
          selectable
          selectedRows={selectedReports}
          onRowSelect={handleRowSelect}
          onSelectAll={handleSelectAll}
        />
      </div>

      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Report</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Content</h3>
              <p>{selectedReport?.content}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Review Notes</h3>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Enter your review notes..."
                className="min-h-[100px]"
              />
            </div>

            {(updateError || failedReports.length > 0) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {updateError}
                  {failedReports.length > 0 && (
                    <div className="mt-2">
                      <p>Failed to process the following reports:</p>
                      <ul className="list-disc list-inside mt-1">
                        {failedReports.map((reportId) => (
                          <li key={reportId}>{reportId}</li>
                        ))}
                      </ul>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReports(failedReports);
                            setFailedReports([]);
                            // Reset retry counts for failed reports
                            const resetCounts = failedReports.reduce((acc, id) => {
                              acc[id] = 0;
                              return acc;
                            }, {} as Record<string, number>);
                            setRetryCount(resetCounts);
                          }}
                        >
                          Retry Failed Reports
                        </Button>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Reports are automatically retried up to {MAX_RETRIES} times
                        </p>
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedReport(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  selectedReports.length > 1
                    ? handleBatchAction("reject")
                    : handleAction("reject")
                }
                disabled={
                  (isUpdating || isBatchProcessing) || !reviewNotes.trim()
                }
              >
                {selectedReports.length > 1 ? "Reject All" : "Reject"}
              </Button>
              <Button
                onClick={() =>
                  selectedReports.length > 1
                    ? handleBatchAction("approve")
                    : handleAction("approve")
                }
                disabled={
                  (isUpdating || isBatchProcessing) || !reviewNotes.trim()
                }
              >
                {selectedReports.length > 1 ? "Approve All" : "Approve"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
