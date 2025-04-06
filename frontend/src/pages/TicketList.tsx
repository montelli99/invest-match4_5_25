import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCcw, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import brain from "brain";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListTicketsData, TicketStatus } from "types";

// Helper function to format dates
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Helper function to get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return "bg-blue-500";
    case "in_progress":
      return "bg-yellow-500";
    case "resolved":
      return "bg-green-500";
    case "closed":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

// Helper function to get priority badge color
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "bg-red-500";
    case "high":
      return "bg-orange-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

export default function TicketList() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<ListTicketsData>([]);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // For manual refresh
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [rating, setRating] = useState<string>("");
  const [featureRatings, setFeatureRatings] = useState({
    filtering: 0,
    tableLayout: 0,
    navigation: 0
  });
  const [usabilityRating, setUsabilityRating] = useState<string>("");
  const [feedbackText, setFeedbackText] = useState("");
  const { toast } = useToast();

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await brain.list_tickets(
        { status: statusFilter !== "all" ? statusFilter : null },
        {},
      );
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Failed to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Sort tickets
  const sortedTickets = [...tickets].sort((a, b) => {
    if (!sortConfig) return 0;

    let aValue = a[sortConfig.key as keyof typeof a];
    let bValue = b[sortConfig.key as keyof typeof b];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortConfig.direction === 'asc' 
      ? (aValue < bValue ? -1 : 1)
      : (bValue < aValue ? -1 : 1);
  });

  // Filter tickets by search query
  const filteredTickets = sortedTickets.filter(ticket => 
    searchQuery ? ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  // Fetch tickets on mount and when filter changes
  useEffect(() => {
    fetchTickets();
  }, [statusFilter, refreshKey]);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-x-4">
          <CardTitle>Support Tickets</CardTitle>
          <div className="flex space-x-2 items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setRefreshKey(k => k + 1)}
              title="Refresh tickets"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Give Feedback</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Page Feedback</DialogTitle>
                  <DialogDescription>
                    Help us improve the ticket list page by sharing your experience.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>How would you rate this page overall? (1-5)</Label>
                    <RadioGroup
                      value={rating}
                      onValueChange={setRating}
                      className="flex space-x-4"
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <div key={value} className="flex items-center space-x-2">
                          <RadioGroupItem value={value.toString()} id={`rating-${value}`} />
                          <Label htmlFor={`rating-${value}`}>{value}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Feature specific ratings */}
                  <div className="space-y-4">
                    <Label className="block font-medium">Rate specific features (1-5):</Label>
                    
                    {/* Filtering System */}
                    <div className="space-y-2">
                      <Label>Filtering System</Label>
                      <RadioGroup
                        value={featureRatings.filtering.toString()}
                        onValueChange={(value) => setFeatureRatings(prev => ({ ...prev, filtering: parseInt(value) }))}
                        className="flex space-x-4"
                      >
                        {[1, 2, 3, 4, 5].map((value) => (
                          <div key={value} className="flex items-center space-x-2">
                            <RadioGroupItem value={value.toString()} id={`filtering-${value}`} />
                            <Label htmlFor={`filtering-${value}`}>{value}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Table Layout */}
                    <div className="space-y-2">
                      <Label>Table Layout and Readability</Label>
                      <RadioGroup
                        value={featureRatings.tableLayout.toString()}
                        onValueChange={(value) => setFeatureRatings(prev => ({ ...prev, tableLayout: parseInt(value) }))}
                        className="flex space-x-4"
                      >
                        {[1, 2, 3, 4, 5].map((value) => (
                          <div key={value} className="flex items-center space-x-2">
                            <RadioGroupItem value={value.toString()} id={`layout-${value}`} />
                            <Label htmlFor={`layout-${value}`}>{value}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-2">
                      <Label>Navigation and Ease of Use</Label>
                      <RadioGroup
                        value={featureRatings.navigation.toString()}
                        onValueChange={(value) => setFeatureRatings(prev => ({ ...prev, navigation: parseInt(value) }))}
                        className="flex space-x-4"
                      >
                        {[1, 2, 3, 4, 5].map((value) => (
                          <div key={value} className="flex items-center space-x-2">
                            <RadioGroupItem value={value.toString()} id={`navigation-${value}`} />
                            <Label htmlFor={`navigation-${value}`}>{value}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>How easy was it to find and filter tickets?</Label>
                    <RadioGroup
                      value={usabilityRating}
                      onValueChange={setUsabilityRating}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="very-easy" id="very-easy" />
                        <Label htmlFor="very-easy">Very Easy</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="easy" id="easy" />
                        <Label htmlFor="easy">Easy</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="neutral" id="neutral" />
                        <Label htmlFor="neutral">Neutral</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="difficult" id="difficult" />
                        <Label htmlFor="difficult">Difficult</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="very-difficult" id="very-difficult" />
                        <Label htmlFor="very-difficult">Very Difficult</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>What could we improve?</Label>
                    <Textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Share your suggestions..."
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    disabled={submittingFeedback}
                    onClick={async () => {
                      if (submittingFeedback) return;
                      setSubmittingFeedback(true);
                      try {
                        await brain.submit_feedback({
                          page: "TicketList",
                          overall_rating: parseInt(rating),
                          usability_rating: usabilityRating,
                          feature_ratings: featureRatings,
                          improvement_suggestions: feedbackText
                        });

                        // Reset form
                        setRating("");
                        setUsabilityRating("");
                        setFeatureRatings({
                          filtering: 0,
                          tableLayout: 0,
                          navigation: 0
                        });
                        setFeedbackText("");
                        setFeedbackOpen(false);
                        
                        // Show success message
                        toast({
                          title: "Feedback Submitted",
                          description: "Thank you for helping us improve!"
                        });
                      } catch (error) {
                        console.error("Error submitting feedback:", error);
                        toast({
                          title: "Error",
                          description: "Failed to submit feedback. Please try again.",
                          variant: "destructive"
                        });
                      } finally {
                        setSubmittingFeedback(false);
                      }
                    }}
                  >
                    Submit Feedback
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={() => navigate("/CreateTicket")}>
            Create New Ticket
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="mb-4 flex space-x-4 items-center">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as TicketStatus)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[300px]"
            />
          </div>

          {/* Error message */}
          {error && <div className="text-red-500 mb-4">{error}</div>}

          {/* Loading state */}
          {loading ? (
            <div className="text-center py-4">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-4">No tickets found</div>
          ) : (
            /* Tickets table */
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => setSortConfig({
                    key: 'title',
                    direction: sortConfig?.key === 'title' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                  })} className="cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center space-x-1">
                      <span>Title</span>
                      {sortConfig?.key === 'title' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead onClick={() => setSortConfig({
                    key: 'priority',
                    direction: sortConfig?.key === 'priority' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                  })} className="cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center space-x-1">
                      <span>Priority</span>
                      {sortConfig?.key === 'priority' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => setSortConfig({
                    key: 'created_at',
                    direction: sortConfig?.key === 'created_at' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                  })} className="cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center space-x-1">
                      <span>Created</span>
                      {sortConfig?.key === 'created_at' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => setSortConfig({
                    key: 'updated_at',
                    direction: sortConfig?.key === 'updated_at' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                  })} className="cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center space-x-1">
                      <span>Last Updated</span>
                      {sortConfig?.key === 'updated_at' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/ViewTicket?id=${ticket.id}`)}
                  >
                    <TableCell>{ticket.title}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{ticket.status === 'open' ? 'Newly created ticket'
                              : ticket.status === 'in_progress' ? 'Being worked on'
                              : ticket.status === 'resolved' ? 'Solution provided'
                              : 'Ticket closed'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge className={getPriorityColor(ticket.priority)}>
                              {ticket.priority.toUpperCase()}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{ticket.priority === 'urgent' ? 'Requires immediate attention'
                              : ticket.priority === 'high' ? 'High business impact'
                              : ticket.priority === 'medium' ? 'Moderate impact'
                              : 'Minimal impact'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>{formatDate(ticket.created_at)}</TableCell>
                    <TableCell>{formatDate(ticket.updated_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
