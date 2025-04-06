import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ReportStatus, ReportType, ActionTemplate } from "types";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, CaretSortIcon } from "@radix-ui/react-icons";

/**
 * Interface for content report
 */
export interface ContentReport {
  id: string;
  type: ReportType;
  content_id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
  review_notes?: string;
  risk_score?: number;
}

/**
 * Props for ReportsSection component
 */
interface ReportsSectionProps {
  reports: ContentReport[];
  selectedReports: string[];
  setSelectedReports: (ids: string[]) => void;
  selectedTemplate: ActionTemplate | null;
  handleStatusUpdate: (reportId: string, newStatus: ReportStatus) => void;
  handleBatchAction: () => void;
}

/**
 * Reports Section Component - Displays and manages content reports
 */
export function ReportsSection({
  reports,
  selectedReports,
  setSelectedReports,
  selectedTemplate,
  handleStatusUpdate,
  handleBatchAction
}: ReportsSectionProps) {
  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ReportType | "all">("all");
  
  // Toggle sort
  const toggleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Get sort direction icon
  const getSortDirectionIcon = (column: string) => {
    if (sortColumn !== column) {
      return <MinusIcon className="ml-2 h-4 w-4" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUpIcon className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDownIcon className="ml-2 h-4 w-4" />
    );
  };

  // Apply filters and sorting
  const filteredAndSortedReports = reports
    .filter((report) => {
      // Apply status filter
      if (statusFilter !== "all" && report.status !== statusFilter) {
        return false;
      }
      
      // Apply type filter
      if (typeFilter !== "all" && report.type !== typeFilter) {
        return false;
      }
      
      // Apply search filter
      if (searchQuery && !report.reason.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      if (!sortColumn) return 0;
      
      let valA: any;
      let valB: any;
      
      // Get values based on sort column
      switch (sortColumn) {
        case "date":
          valA = new Date(a.created_at).getTime();
          valB = new Date(b.created_at).getTime();
          break;
        case "type":
          valA = a.type;
          valB = b.type;
          break;
        case "status":
          valA = a.status;
          valB = b.status;
          break;
        case "risk":
          valA = a.risk_score;
          valB = b.risk_score;
          break;
        default:
          return 0;
      }
      
      // Apply sort direction
      if (valA < valB) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (valA > valB) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });

  // Toggle all reports selection
  const toggleAllReports = () => {
    if (selectedReports.length === filteredAndSortedReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredAndSortedReports.map((report) => report.id));
    }
  };

  // Toggle single report selection
  const toggleReportSelection = (id: string) => {
    if (selectedReports.includes(id)) {
      setSelectedReports(selectedReports.filter((reportId) => reportId !== id));
    } else {
      setSelectedReports([...selectedReports, id]);
    }
  };
  
  // Get status badge style
  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING:
        return <Badge variant="secondary">Pending</Badge>;
      case ReportStatus.REVIEWED:
        return <Badge variant="primary">Reviewed</Badge>;
      case ReportStatus.RESOLVED:
        return <Badge variant="success">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Get risk score badge style
  const getRiskScoreBadge = (score: number) => {
    if (score >= 80) {
      return <Badge variant="destructive">{score}</Badge>;
    } else if (score >= 50) {
      return <Badge variant="warning">{score}</Badge>;
    } else {
      return <Badge variant="outline">{score}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as ReportStatus | "all")}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value={ReportStatus.PENDING}>Pending</SelectItem>
              <SelectItem value={ReportStatus.REVIEWED}>Reviewed</SelectItem>
              <SelectItem value={ReportStatus.RESOLVED}>Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as ReportType | "all")}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={ReportType.PROFILE}>Profile</SelectItem>
              <SelectItem value={ReportType.MESSAGE}>Message</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setTypeFilter("all");
            }}
          >
            Clear Filters
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            disabled={selectedReports.length === 0 || !selectedTemplate}
            onClick={handleBatchAction}
          >
            Apply Action
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Content Reports</CardTitle>
          <CardDescription>
            {filteredAndSortedReports.length} reports found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedReports.length === filteredAndSortedReports.length && filteredAndSortedReports.length > 0} 
                      onCheckedChange={toggleAllReports} 
                    />
                  </TableHead>
                  <TableHead className="w-48">
                    <div className="flex items-center cursor-pointer" onClick={() => toggleSort("date")}>
                      Date Reported {getSortDirectionIcon("date")}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div>Content</div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => toggleSort("type")}>
                      Type {getSortDirectionIcon("type")}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => toggleSort("risk")}>
                      Risk Score {getSortDirectionIcon("risk")}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => toggleSort("status")}>
                      Status {getSortDirectionIcon("status")}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedReports.includes(report.id)} 
                        onCheckedChange={() => toggleReportSelection(report.id)} 
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {new Date(report.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md truncate">{report.reason}</div>
                    </TableCell>
                    <TableCell>
                      {report.type === ReportType.PROFILE ? (
                        <Badge variant="outline">Profile</Badge>
                      ) : (
                        <Badge variant="outline">Message</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {getRiskScoreBadge(report.risk_score || 0)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(report.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <CaretSortIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStatusUpdate(report.id, ReportStatus.PENDING)}>
                            Mark as Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(report.id, ReportStatus.REVIEWED)}>
                            Mark as Reviewed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(report.id, ReportStatus.RESOLVED)}>
                            Mark as Resolved
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredAndSortedReports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No reports found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}