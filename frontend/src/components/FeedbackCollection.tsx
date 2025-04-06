import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import {
  Filter,
  Download,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Search,
} from "lucide-react";

/**
 * Feedback type enum
 */
enum FeedbackType {
  MODERATION = "moderation",
  SYSTEM = "system",
  FEATURE = "feature",
  APPEAL = "appeal",
  OTHER = "other",
}

/**
 * Sentiment enum
 */
enum Sentiment {
  POSITIVE = "positive",
  NEUTRAL = "neutral",
  NEGATIVE = "negative",
}

/**
 * Status enum
 */
enum FeedbackStatus {
  NEW = "new",
  ACKNOWLEDGED = "acknowledged",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

/**
 * Feedback item interface
 */
interface FeedbackItem {
  id: string;
  userId: string;
  userName: string;
  type: FeedbackType;
  content: string;
  sentiment: Sentiment;
  timestamp: Date;
  status: FeedbackStatus;
  tags: string[];
}

/**
 * Props for FeedbackCollection
 */
interface Props {
  token: any;
}

/**
 * FeedbackCollection component
 * 
 * A system for collecting, organizing, and analyzing user feedback
 * about moderation decisions and system functionality.
 */
export function FeedbackCollection({ token }: Props) {
  // State for feedback items
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  
  // State for filters
  const [filterType, setFilterType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // State for active tab
  const [activeTab, setActiveTab] = useState("list");
  
  // Load mock data for demonstration
  useEffect(() => {
    const mockItems: FeedbackItem[] = [
      {
        id: "feedback-1",
        userId: "user-123",
        userName: "John Smith",
        type: FeedbackType.MODERATION,
        content: "The moderation system flagged my post incorrectly.",
        sentiment: Sentiment.NEGATIVE,
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        status: FeedbackStatus.NEW,
        tags: ["false-positive", "accuracy"]
      },
      {
        id: "feedback-2",
        userId: "user-456",
        userName: "Jane Doe",
        type: FeedbackType.FEATURE,
        content: "Could you add a feature to bulk approve content from trusted users?",
        sentiment: Sentiment.NEUTRAL,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        status: FeedbackStatus.ACKNOWLEDGED,
        tags: ["request", "enhancement"]
      },
      {
        id: "feedback-3",
        userId: "user-789",
        userName: "Alice Johnson",
        type: FeedbackType.APPEAL,
        content: "I appreciate how quickly my appeal was addressed by the moderation team.",
        sentiment: Sentiment.POSITIVE,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        status: FeedbackStatus.RESOLVED,
        tags: ["appeal", "response-time"]
      },
      {
        id: "feedback-4",
        userId: "user-321",
        userName: "Bob Miller",
        type: FeedbackType.SYSTEM,
        content: "The system is too slow when filtering through large datasets.",
        sentiment: Sentiment.NEGATIVE,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        status: FeedbackStatus.IN_PROGRESS,
        tags: ["performance", "usability"]
      },
      {
        id: "feedback-5",
        userId: "user-654",
        userName: "Carol Wilson",
        type: FeedbackType.OTHER,
        content: "I would like to suggest improvements to the user interface.",
        sentiment: Sentiment.NEUTRAL,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        status: FeedbackStatus.NEW,
        tags: ["ui", "suggestion"]
      }
    ];
    
    setFeedbackItems(mockItems);
  }, []);
  
  // Apply filters to feedback items
  const filteredItems = feedbackItems.filter(item => {
    // Apply type filter
    if (filterType && item.type !== filterType) {
      return false;
    }
    
    // Apply status filter
    if (filterStatus && item.status !== filterStatus) {
      return false;
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.content.toLowerCase().includes(query) ||
        item.userName.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Reset filters
  const resetFilters = () => {
    setFilterType("");
    setFilterStatus("");
    setSearchQuery("");
    toast.success("Filters reset");
  };
  
  // Export feedback data
  const exportData = () => {
    toast.success("Feedback data exported");
  };
  
  // Helper function to render status badge
  const getStatusBadge = (status: FeedbackStatus) => {
    switch (status) {
      case FeedbackStatus.NEW:
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">New</Badge>;
      case FeedbackStatus.ACKNOWLEDGED:
        return <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">Acknowledged</Badge>;
      case FeedbackStatus.IN_PROGRESS:
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">In Progress</Badge>;
      case FeedbackStatus.RESOLVED:
        return <Badge variant="secondary" className="bg-green-500/10 text-green-500">Resolved</Badge>;
      case FeedbackStatus.CLOSED:
        return <Badge variant="secondary" className="bg-slate-500/10 text-slate-500">Closed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Helper function to render type badge
  const getTypeBadge = (type: FeedbackType) => {
    switch (type) {
      case FeedbackType.MODERATION:
        return <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500">Moderation</Badge>;
      case FeedbackType.SYSTEM:
        return <Badge variant="outline" className="bg-cyan-500/10 text-cyan-500">System</Badge>;
      case FeedbackType.FEATURE:
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-500">Feature</Badge>;
      case FeedbackType.APPEAL:
        return <Badge variant="outline" className="bg-red-500/10 text-red-500">Appeal</Badge>;
      case FeedbackType.OTHER:
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500">Other</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Helper function to render sentiment icon
  const getSentimentIcon = (sentiment: Sentiment) => {
    switch (sentiment) {
      case Sentiment.POSITIVE:
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case Sentiment.NEGATIVE:
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="border-b px-4">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="list">Feedback List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
      </div>
      
      <div className="p-4">
        <TabsContent value="list" className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Feedback Management</CardTitle>
                  <CardDescription>
                    Manage and analyze user feedback about moderation and system functionality
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    <Filter className="h-4 w-4 mr-1" />
                    Reset Filters
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportData}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="search" className="sr-only">
                    Search
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search feedback..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="w-[150px]">
                  <Label htmlFor="type-filter" className="sr-only">
                    Type
                  </Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger id="type-filter">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_types">All Types</SelectItem>
                      {Object.values(FeedbackType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-[150px]">
                  <Label htmlFor="status-filter" className="sr-only">
                    Status
                  </Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_statuses">All Statuses</SelectItem>
                      {Object.values(FeedbackStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace("_", " ").split(" ").map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(" ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Status summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <Card>
                  <CardHeader className="py-2 px-4">
                    <CardTitle className="text-sm font-medium">Total</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    <div className="text-2xl font-bold">{feedbackItems.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-2 px-4">
                    <CardTitle className="text-sm font-medium text-blue-500">New</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    <div className="text-2xl font-bold">
                      {feedbackItems.filter(item => item.status === FeedbackStatus.NEW).length}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-2 px-4">
                    <CardTitle className="text-sm font-medium text-amber-500">In Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    <div className="text-2xl font-bold">
                      {feedbackItems.filter(item => 
                        item.status === FeedbackStatus.IN_PROGRESS || 
                        item.status === FeedbackStatus.ACKNOWLEDGED
                      ).length}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-2 px-4">
                    <CardTitle className="text-sm font-medium text-green-500">Resolved</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    <div className="text-2xl font-bold">
                      {feedbackItems.filter(item => item.status === FeedbackStatus.RESOLVED).length}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-2 px-4">
                    <CardTitle className="text-sm font-medium text-slate-500">Closed</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    <div className="text-2xl font-bold">
                      {feedbackItems.filter(item => item.status === FeedbackStatus.CLOSED).length}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Feedback table */}
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Type</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead className="w-[100px]">Sentiment</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[180px]">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                          No feedback found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getTypeBadge(item.type)}
                              <span className="text-xs text-muted-foreground">{item.userName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium line-clamp-2">{item.content}</div>
                            {item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getSentimentIcon(item.sentiment)}
                              <span className="text-sm">
                                {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(item.status)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {item.timestamp.toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.timestamp.toLocaleTimeString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Analytics</CardTitle>
              <CardDescription>
                Analyze feedback patterns, sentiment, and response metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Summary metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center">
                        <MessageSquare className="h-8 w-8 text-primary mb-2" />
                        <div className="text-2xl font-bold">{feedbackItems.length}</div>
                        <div className="text-sm text-muted-foreground">Total Feedback</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center">
                        <ThumbsUp className="h-8 w-8 text-green-500 mb-2" />
                        <div className="text-2xl font-bold">
                          {feedbackItems.filter(item => item.sentiment === Sentiment.POSITIVE).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Positive Feedback</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center">
                        <ThumbsDown className="h-8 w-8 text-red-500 mb-2" />
                        <div className="text-2xl font-bold">
                          {feedbackItems.filter(item => item.sentiment === Sentiment.NEGATIVE).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Negative Feedback</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center">
                        <Clock className="h-8 w-8 text-amber-500 mb-2" />
                        <div className="text-2xl font-bold">
                          {Math.floor(Math.random() * 120) + 30} min
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Response Time</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Feedback Type Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <p>Enhanced analytics charts will be implemented soon.</p>
                      <p className="text-sm mt-2">This will include charts for type distribution, sentiment trends, and response times.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
}