import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import brain from "brain";
import React from "react";
import { toast } from "sonner";
import { DatePicker } from "./DatePicker";
import { PrivacySettings } from "./PrivacySettings";

interface ExportResponse {
  status: "completed" | "in_progress" | "failed";
  progress?: number;
  download_url?: string;
  error_message?: string;
}

interface EstimateResponse {
  estimated_size_bytes: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function DataExportDialog({ open, onOpenChange, userId }: Props) {
  const [format, setFormat] = React.useState("json");
  const [includeProfile, setIncludeProfile] = React.useState(true);
  const [includeMatches, setIncludeMatches] = React.useState(true);
  const [includeMessages, setIncludeMessages] = React.useState(true);
  const [includeAnalytics, setIncludeAnalytics] = React.useState(true);
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportProgress, setExportProgress] = React.useState(0);
  const [estimatedSize, setEstimatedSize] = React.useState<number | null>(null);

  // Validate date range
  const dateError = React.useMemo(() => {
    if (startDate && endDate && startDate > endDate) {
      return "Start date must be before end date";
    }
    return null;
  }, [startDate, endDate]);

  const estimateExportSize = async () => {
    try {
      const response = await brain.estimate_export_size({
        user_id: userId,
        include_profile: includeProfile,
        include_matches: includeMatches,
        include_messages: includeMessages,
        include_analytics: includeAnalytics,
        start_date: startDate?.toISOString(),
        end_date: endDate?.toISOString(),
      });
      const data = await response.json();
      setEstimatedSize(data.estimated_size_bytes);
    } catch (error) {
      console.error("Failed to estimate size:", error);
    }
  };

  // Update size estimate when options change
  React.useEffect(() => {
    if (open) {
      estimateExportSize();
    }
  }, [open, includeProfile, includeMatches, includeMessages, includeAnalytics, startDate, endDate]);

  const handleExport = async () => {
    if (dateError) {
      toast.error(dateError);
      return;
    }
    try {
      setIsExporting(true);
      const response = await brain.export_user_data({
        user_id: userId,
        format,
        include_profile: includeProfile,
        include_matches: includeMatches,
        include_messages: includeMessages,
        include_analytics: includeAnalytics,
        start_date: startDate?.toISOString(),
        end_date: endDate?.toISOString(),
      });

      const data = await response.json();

      // Handle progress updates
      if (data.status === "in_progress" && data.progress) {
        setExportProgress(data.progress);
        return;
      }

      if (data.status === "completed" && data.download_url) {
        // Trigger download
        window.location.href = data.download_url;
        toast.success("Export completed successfully");
        onOpenChange(false);
      } else {
        toast.error(data.error_message || "Export failed");
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Choose what data to include in your export and select your preferred format. The estimated file size will be shown based on your selection.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-2">Export Format</Label>
            <div className="col-span-2">
              <Select
                value={format}
                onValueChange={setFormat}
              >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {estimatedSize !== null && (
              <div className="text-sm text-muted-foreground">
                Estimated export size: {(estimatedSize / (1024 * 1024)).toFixed(2)} MB
              </div>
            )}

            {isExporting && (
              <div className="space-y-2">
                <Progress value={exportProgress} />
                <p className="text-sm text-muted-foreground text-center">
                  {exportProgress}% complete
                </p>
              </div>
            )}

            <TooltipProvider>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="profile"
                checked={includeProfile}
                onCheckedChange={(checked) => setIncludeProfile(!!checked)}
              />
              <div className="flex items-center space-x-1">
                <Label htmlFor="profile">Include Profile Data</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export your profile information including personal details and preferences</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="matches"
                checked={includeMatches}
                onCheckedChange={(checked) => setIncludeMatches(!!checked)}
              />
              <div className="flex items-center space-x-1">
                <Label htmlFor="matches">Include Matches</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export your match history and connection data</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="messages"
                checked={includeMessages}
                onCheckedChange={(checked) => setIncludeMessages(!!checked)}
              />
              <div className="flex items-center space-x-1">
                <Label htmlFor="messages">Include Messages</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export your message history with other users</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="analytics"
                checked={includeAnalytics}
                onCheckedChange={(checked) => setIncludeAnalytics(!!checked)}
              />
              <div className="flex items-center space-x-1">
                <Label htmlFor="analytics">Include Analytics</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export your usage statistics and performance metrics</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            </TooltipProvider>
          </div>

          <div className="space-y-4">
            <Label>Privacy Settings</Label>
            <PrivacySettings userId={userId} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <DatePicker date={startDate} onSelect={setStartDate} />
            </div>
            <div>
              <Label>End Date</Label>
              <DatePicker date={endDate} onSelect={setEndDate} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || !!dateError}
            title={dateError || ""}>
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
