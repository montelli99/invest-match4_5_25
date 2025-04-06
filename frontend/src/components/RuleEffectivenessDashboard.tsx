import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { RuleEffectiveness } from "types";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, CaretSortIcon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { PieChart as PieChartIcon, BarChart as BarChartIcon, Activity, Shield, Filter, TrendingUp, Search, SlidersHorizontal, AlertTriangle, CheckCircle } from "lucide-react";

interface Props {
  effectiveness: RuleEffectiveness[];
  rules?: Array<{
    id: string;
    type: "profile" | "message";
    pattern: string;
    action: string;
    severity: string;
    isActive: boolean;
    priority: "low" | "medium" | "high" | "critical";
    category: string;
    matchCount: number;
    falsePositiveCount: number;
  }>;
}

interface TrendIndicatorProps {
  value: number;
  previousValue: number;
  className?: string;
}

interface RuleAnalysisData {
  id: string;
  patternComplexity: number;
  patternFragments: string[];
  characterClasses: string[];
  specialCharacters: number;
  avgMatchLength: number;
  commonMatches: { text: string; count: number }[];
  falsePositiveExamples: { text: string; timestamp: string }[];
  performance: {
    avgMatchTime: number;
    timeDistribution: { range: string; count: number }[];
  };
}

interface ModeratorPerformance {
  moderatorId: string;
  name: string;
  avatar?: string;
  reviewCount: number;
  accuracy: number;
  avgResponseTime: number;
  consistencyScore: number;
  specialization: string[];
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ value, previousValue, className }) => {
  const difference = value - previousValue;
  const percentChange = previousValue !== 0 ? (difference / previousValue) * 100 : 0;
  
  return (
    <div className={`flex items-center gap-1 text-sm ${className}`}>
      {Math.abs(percentChange) < 1 ? (
        <MinusIcon className="text-yellow-500" />
      ) : percentChange > 0 ? (
        <ArrowUpIcon className="text-green-500" />
      ) : (
        <ArrowDownIcon className="text-red-500" />
      )}
      <span className={`${Math.abs(percentChange) < 1 ? "text-yellow-500" : percentChange > 0 ? "text-green-500" : "text-red-500"}`}>
        {Math.abs(percentChange).toFixed(1)}%
      </span>
    </div>
  );
};

const generateMockHistoricalData = (dataPoints: number = 7) => {
  return Array.from({ length: dataPoints }, (_, i) => ({
    day: i + 1,
    matches: Math.floor(Math.random() * 100),
    accuracy: 75 + Math.random() * 20,
    actions: Math.floor(Math.random() * 50)
  }));
};

export const RuleEffectivenessDashboard: React.FC<Props> = ({ effectiveness, rules = [] }) => {
  const [sortBy, setSortBy] = useState<string>("effectiveness");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  // For demo purposes - in production, this would come from the API
  const historicalData = generateMockHistoricalData();
  
  // Mock moderator performance data
  const moderatorPerformance: ModeratorPerformance[] = [
    {
      moderatorId: "mod1",
      name: "Alex Johnson",
      reviewCount: 432,
      accuracy: 94.2,
      avgResponseTime: 45.8,
      consistencyScore: 92,
      specialization: ["spam", "harassment"]
    },
    {
      moderatorId: "mod2",
      name: "Sam Rivera",
      reviewCount: 387,
      accuracy: 91.7,
      avgResponseTime: 32.1,
      consistencyScore: 88,
      specialization: ["fraud", "inappropriate"]
    },
    {
      moderatorId: "mod3",
      name: "Taylor Kim",
      reviewCount: 512,
      accuracy: 96.3,
      avgResponseTime: 38.4,
      consistencyScore: 95,
      specialization: ["custom", "spam"]
    },
  ];
  
  // Sample rule analysis data - in production this would come from API
  const ruleAnalysis: Record<string, RuleAnalysisData> = {};
  effectiveness.forEach(rule => {
    ruleAnalysis[rule.rule_id] = {
      id: rule.rule_id,
      patternComplexity: Math.floor(Math.random() * 10) + 1,
      patternFragments: ["[a-zA-Z0-9]", "\\d+", "(example|sample)"],
      characterClasses: ["\\w", "\\d", "\\s"],
      specialCharacters: Math.floor(Math.random() * 5),
      avgMatchLength: Math.floor(Math.random() * 20) + 10,
      commonMatches: [
        { text: "sample text 1", count: Math.floor(Math.random() * 100) },
        { text: "another example", count: Math.floor(Math.random() * 80) },
        { text: "test content", count: Math.floor(Math.random() * 60) }
      ],
      falsePositiveExamples: [
        { text: "legitimate content", timestamp: new Date().toISOString() },
        { text: "false match example", timestamp: new Date().toISOString() }
      ],
      performance: {
        avgMatchTime: Math.random() * 10,
        timeDistribution: [
          { range: "<1ms", count: Math.floor(Math.random() * 100) },
          { range: "1-5ms", count: Math.floor(Math.random() * 80) },
          { range: "5-10ms", count: Math.floor(Math.random() * 40) },
          { range: ">10ms", count: Math.floor(Math.random() * 20) }
        ]
      }
    };
  });

  const overallStats = effectiveness.reduce((acc, rule) => ({
    totalMatches: acc.totalMatches + rule.total_matches,
    totalActions: acc.totalActions + rule.actions_taken,
    avgAccuracy: acc.avgAccuracy + rule.effectiveness_score,
    totalRules: acc.totalRules + 1
  }), { totalMatches: 0, totalActions: 0, avgAccuracy: 0, totalRules: 0 });

  if (overallStats.totalRules > 0) {
    overallStats.avgAccuracy /= overallStats.totalRules;
  }
  
  // Apply sorting and filtering
  const sortedEffectiveness = useMemo(() => {
    const filtered = effectiveness.filter(rule => {
      if (!searchTerm) return true;
      return rule.rule_id.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    return filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch(sortBy) {
        case "effectiveness":
          valueA = a.effectiveness_score;
          valueB = b.effectiveness_score;
          break;
        case "matches":
          valueA = a.total_matches;
          valueB = b.total_matches;
          break;
        case "falsePositives":
          valueA = a.false_positives;
          valueB = b.false_positives;
          break;
        case "actions":
          valueA = a.actions_taken;
          valueB = b.actions_taken;
          break;
        default:
          valueA = a.effectiveness_score;
          valueB = b.effectiveness_score;
      }
      
      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    });
  }, [effectiveness, sortBy, sortDirection, searchTerm]);
  
  // Combine data for trend visualization
  const trendData = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const day = i + 1;
      return {
        day,
        accuracy: 70 + Math.random() * 20,
        falsePositives: Math.floor(Math.random() * 10),
        matches: 20 + Math.floor(Math.random() * 50),
        actionRate: 0.5 + Math.random() * 0.4
      };
    });
  }, []);
  
  // Group rules by category
  const rulesByCategory = useMemo(() => {
    const categories: Record<string, number> = {};
    
    rules.forEach(rule => {
      if (!categories[rule.category]) {
        categories[rule.category] = 0;
      }
      categories[rule.category]++;
    });
    
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [rules]);
  
  // Handle rule selection for detailed view
  const handleRuleSelect = (ruleId: string) => {
    setSelectedRuleId(ruleId);
  };
  
  // Find details for selected rule
  const selectedRule = useMemo(() => {
    if (!selectedRuleId) return null;
    return effectiveness.find(rule => rule.rule_id === selectedRuleId);
  }, [selectedRuleId, effectiveness]);
  
  const selectedRuleAnalysis = selectedRuleId ? ruleAnalysis[selectedRuleId] : null;
  
  // Render the rule details dialog
  const renderRuleDetailsDialog = () => {
    if (!selectedRule || !selectedRuleAnalysis) return null;
    
    return (
      <Dialog open={!!selectedRuleId} onOpenChange={(open) => !open && setSelectedRuleId(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Rule Analysis:</span>
              <Badge className="ml-1">{selectedRule.rule_id}</Badge>
              <Badge
                variant={selectedRule.effectiveness_score > 80 ? "default" : selectedRule.effectiveness_score > 50 ? "secondary" : "destructive"}
                className="ml-auto"
              >
                {selectedRule.effectiveness_score.toFixed(1)}% Effective
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <Tabs defaultValue="performance">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="pattern">Pattern Analysis</TabsTrigger>
                <TabsTrigger value="matches">Match Examples</TabsTrigger>
                <TabsTrigger value="falsePositives">False Positives</TabsTrigger>
              </TabsList>
              
              <TabsContent value="performance" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Effectiveness Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottom', offset: -5 }} />
                            <YAxis label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="accuracy" stroke="var(--primary)" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Match Processing Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={selectedRuleAnalysis.performance.timeDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="var(--primary)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-2 text-sm text-center text-muted-foreground">
                        Average processing time: {selectedRuleAnalysis.performance.avgMatchTime.toFixed(2)}ms
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Key Performance Indicators</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Accuracy</div>
                        <div className="text-2xl font-bold">{selectedRule.effectiveness_score.toFixed(1)}%</div>
                        <Progress value={selectedRule.effectiveness_score} className="h-2" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Match Rate</div>
                        <div className="text-2xl font-bold">{selectedRule.total_matches}</div>
                        <Progress value={(selectedRule.total_matches / (overallStats.totalMatches || 1)) * 100} className="h-2" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">False Positives</div>
                        <div className="text-2xl font-bold">{selectedRule.false_positives}</div>
                        <Progress value={(selectedRule.false_positives / (selectedRule.total_matches || 1)) * 100} className="h-2" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Action Rate</div>
                        <div className="text-2xl font-bold">
                          {((selectedRule.actions_taken / (selectedRule.total_matches || 1)) * 100).toFixed(1)}%
                        </div>
                        <Progress value={(selectedRule.actions_taken / (selectedRule.total_matches || 1)) * 100} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="pattern" className="space-y-4 pt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pattern Complexity Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Complexity Score</div>
                        <div className="flex items-end gap-2">
                          <div className="text-2xl font-bold">{selectedRuleAnalysis.patternComplexity}</div>
                          <div className="text-sm text-muted-foreground mb-1">/10</div>
                        </div>
                        <Progress 
                          value={selectedRuleAnalysis.patternComplexity * 10} 
                          className="h-2"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Special Characters</div>
                        <div className="text-2xl font-bold">{selectedRuleAnalysis.specialCharacters}</div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Avg Match Length</div>
                        <div className="text-2xl font-bold">{selectedRuleAnalysis.avgMatchLength} chars</div>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-4">
                      <div>
                        <div className="text-sm font-medium mb-2">Pattern Fragments</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedRuleAnalysis.patternFragments.map((fragment, i) => (
                            <Badge key={i} variant="outline" className="font-mono">{fragment}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium mb-2">Character Classes</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedRuleAnalysis.characterClasses.map((charClass, i) => (
                            <Badge key={i} variant="outline" className="font-mono">{charClass}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <div className="text-sm font-medium mb-2">Optimization Suggestions</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <CheckIcon className="text-green-500 mt-0.5" />
                          <span>Use non-capturing groups (?:pattern) where possible</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="text-amber-500 h-4 w-4 mt-0.5" />
                          <span>Consider simplifying character classes for better performance</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Cross2Icon className="text-red-500 mt-0.5" />
                          <span>Avoid nested repetition which can cause catastrophic backtracking</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="matches" className="space-y-4 pt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Most Common Matches</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Matched Content</TableHead>
                          <TableHead className="text-right">Occurrences</TableHead>
                          <TableHead className="text-right">% of Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedRuleAnalysis.commonMatches.map((match, i) => {
                          const percentage = (match.count / selectedRule.total_matches) * 100;
                          return (
                            <TableRow key={i}>
                              <TableCell className="font-mono">{match.text}</TableCell>
                              <TableCell className="text-right">{match.count}</TableCell>
                              <TableCell className="text-right">{percentage.toFixed(1)}%</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Match Distribution</div>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={selectedRuleAnalysis.commonMatches}
                              dataKey="count"
                              nameKey="text"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="var(--primary)"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {selectedRuleAnalysis.commonMatches.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={`hsl(${index * 40}, 70%, 50%)`} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} occurrences`, 'Count']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="falsePositives" className="space-y-4 pt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">False Positive Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">False Positive Rate</div>
                        <div className="text-2xl font-bold">
                          {((selectedRule.false_positives / (selectedRule.total_matches || 1)) * 100).toFixed(1)}%
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-muted-foreground">Total False Positives</div>
                        <div className="text-2xl font-bold">{selectedRule.false_positives}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-muted-foreground">Last False Positive</div>
                        <div className="text-xl font-medium">
                          {selectedRule.last_false_positive ? new Date(selectedRule.last_false_positive).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="text-sm font-medium">Examples of False Positives</div>
                      {selectedRuleAnalysis.falsePositiveExamples.length > 0 ? (
                        <div className="space-y-3">
                          {selectedRuleAnalysis.falsePositiveExamples.map((example, i) => (
                            <Card key={i}>
                              <CardContent className="p-3">
                                <div className="flex justify-between items-start">
                                  <div className="font-mono text-sm break-all">{example.text}</div>
                                  <Badge variant="outline" className="ml-2 shrink-0">
                                    {new Date(example.timestamp).toLocaleDateString()}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          No false positive examples recorded
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6">
                      <div className="text-sm font-medium mb-2">Improvement Recommendations</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="text-green-500 h-4 w-4 mt-0.5" />
                          <span>Add negative lookbehinds to exclude legitimate patterns</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="text-green-500 h-4 w-4 mt-0.5" />
                          <span>Increase pattern specificity with word boundaries</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="text-green-500 h-4 w-4 mt-0.5" />
                          <span>Consider using complementary rules with lower severity</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRuleId(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Render the moderator performance section
  const renderModeratorPerformance = () => (
    <Card>
      <CardHeader>
        <CardTitle>Moderator Performance</CardTitle>
        <CardDescription>Effectiveness metrics by moderator</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Moderator</TableHead>
              <TableHead>Reviews</TableHead>
              <TableHead>Accuracy</TableHead>
              <TableHead>Avg Time</TableHead>
              <TableHead>Consistency</TableHead>
              <TableHead>Specialization</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {moderatorPerformance.map((moderator) => (
              <TableRow key={moderator.moderatorId}>
                <TableCell className="font-medium">{moderator.name}</TableCell>
                <TableCell>{moderator.reviewCount}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{moderator.accuracy.toFixed(1)}%</span>
                    <Progress value={moderator.accuracy} className="w-16 h-2" />
                  </div>
                </TableCell>
                <TableCell>{moderator.avgResponseTime.toFixed(1)}s</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{moderator.consistencyScore}%</span>
                    <Progress value={moderator.consistencyScore} className="w-16 h-2" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {moderator.specialization.map((spec, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{spec}</Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Controls for filtering and sorting */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="effectiveness">Effectiveness</SelectItem>
              <SelectItem value="matches">Total Matches</SelectItem>
              <SelectItem value="falsePositives">False Positives</SelectItem>
              <SelectItem value="actions">Actions Taken</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
            title={sortDirection === "asc" ? "Sort descending" : "Sort ascending"}
          >
            <CaretSortIcon className="h-4 w-4" />
            <span className="sr-only">{sortDirection === "asc" ? "Sort descending" : "Sort ascending"}</span>
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rules..."
              className="pl-8 w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <PieChartIcon className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="rules">
            <Shield className="mr-2 h-4 w-4" />
            Rule Analysis
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Activity className="mr-2 h-4 w-4" />
            Moderator Performance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="pt-6 space-y-6">
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Overall Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {overallStats.avgAccuracy.toFixed(1)}%
                </div>
                <TrendIndicator value={overallStats.avgAccuracy} previousValue={overallStats.avgAccuracy * 0.95} />
                <div className="h-[100px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData}>
                      <Line type="monotone" dataKey="accuracy" stroke="var(--primary)" strokeWidth={2} dot={false} />
                      <Tooltip />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {overallStats.totalMatches.toLocaleString()}
                </div>
                <TrendIndicator value={overallStats.totalMatches} previousValue={overallStats.totalMatches * 0.9} />
                <div className="h-[100px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalData}>
                      <Area type="monotone" dataKey="matches" fill="var(--primary)" fillOpacity={0.2} stroke="var(--primary)" />
                      <Tooltip />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Actions Taken</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {overallStats.totalActions.toLocaleString()}
                </div>
                <TrendIndicator value={overallStats.totalActions} previousValue={overallStats.totalActions * 0.85} />
                <div className="h-[100px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historicalData}>
                      <Bar dataKey="actions" fill="var(--primary)" />
                      <Tooltip />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Individual Rule Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedEffectiveness.map((rule) => {
              return (
                <Card key={rule.rule_id} className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">
                      Rule {rule.rule_id}
                      <Badge
                        variant={rule.effectiveness_score > 80 ? "default" : rule.effectiveness_score > 50 ? "secondary" : "destructive"}
                        className="ml-2"
                      >
                        {rule.effectiveness_score.toFixed(1)}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Accuracy</span>
                          <span>{rule.effectiveness_score.toFixed(1)}%</span>
                        </div>
                        <Progress value={rule.effectiveness_score} className="h-2" />
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Total Matches</span>
                            <div className="flex items-center gap-2">
                              <span>{rule.total_matches.toLocaleString()}</span>
                              <TrendIndicator 
                                value={rule.total_matches} 
                                previousValue={rule.total_matches * 0.9}
                                className="ml-2"
                              />
                            </div>
                          </div>
                          <Progress 
                            value={(rule.total_matches / (overallStats.totalMatches || 1)) * 100} 
                            className="h-1"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>False Positives</span>
                            <div className="flex items-center gap-2">
                              <span>{rule.false_positives.toLocaleString()}</span>
                              <TrendIndicator 
                                value={rule.false_positives} 
                                previousValue={rule.false_positives * 1.1}
                                className="ml-2"
                              />
                            </div>
                          </div>
                          <Progress 
                            value={(rule.false_positives / (rule.total_matches || 1)) * 100} 
                            className="h-1"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Actions Taken</span>
                            <div className="flex items-center gap-2">
                              <span>{rule.actions_taken.toLocaleString()}</span>
                              <TrendIndicator 
                                value={rule.actions_taken} 
                                previousValue={rule.actions_taken * 0.95}
                                className="ml-2"
                              />
                            </div>
                          </div>
                          <Progress 
                            value={(rule.actions_taken / (rule.total_matches || 1)) * 100} 
                            className="h-1"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2 text-sm text-muted-foreground">
                        {rule.last_match && (
                          <div>
                            <span>Last Match: </span>
                            <span>{new Date(rule.last_match).toLocaleString()}</span>
                          </div>
                        )}
                        {rule.last_false_positive && (
                          <div>
                            <span>Last False Positive: </span>
                            <span>{new Date(rule.last_false_positive).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      
                      <Button variant="outline" size="sm" className="w-full" onClick={() => handleRuleSelect(rule.rule_id)}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="rules" className="pt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Rules by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={rulesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {rulesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 30}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} rules`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Effectiveness Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: '90-100%', value: effectiveness.filter(r => r.effectiveness_score >= 90).length },
                      { name: '75-90%', value: effectiveness.filter(r => r.effectiveness_score >= 75 && r.effectiveness_score < 90).length },
                      { name: '50-75%', value: effectiveness.filter(r => r.effectiveness_score >= 50 && r.effectiveness_score < 75).length },
                      { name: '25-50%', value: effectiveness.filter(r => r.effectiveness_score >= 25 && r.effectiveness_score < 50).length },
                      { name: '0-25%', value: effectiveness.filter(r => r.effectiveness_score < 25).length },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} rules`, 'Count']} />
                      <Bar dataKey="value" fill="var(--primary)">
                        {[
                          { range: '90-100%', fill: 'hsl(142, 76%, 36%)' },
                          { range: '75-90%', fill: 'hsl(78, 76%, 36%)' },
                          { range: '50-75%', fill: 'hsl(48, 76%, 50%)' },
                          { range: '25-50%', fill: 'hsl(28, 90%, 55%)' },
                          { range: '0-25%', fill: 'hsl(4, 90%, 58%)' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Rule Effectiveness Analysis</CardTitle>
              <CardDescription>Detailed performance metrics for all content moderation rules</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule ID</TableHead>
                    <TableHead>Effectiveness</TableHead>
                    <TableHead>Matches</TableHead>
                    <TableHead>False Positives</TableHead>
                    <TableHead>Actions</TableHead>
                    <TableHead>Last Match</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEffectiveness.map((rule) => (
                    <TableRow key={rule.rule_id}>
                      <TableCell className="font-medium">{rule.rule_id}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={rule.effectiveness_score}
                            className="w-[60px] h-2"
                          />
                          <span>{rule.effectiveness_score.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{rule.total_matches}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span>{rule.false_positives}</span>
                          <span className="text-xs text-muted-foreground">
                            ({((rule.false_positives / (rule.total_matches || 1)) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span>{rule.actions_taken}</span>
                          <span className="text-xs text-muted-foreground">
                            ({((rule.actions_taken / (rule.total_matches || 1)) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{
                        rule.last_match ? 
                          new Date(rule.last_match).toLocaleDateString() : 
                          'Never'
                      }</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleRuleSelect(rule.rule_id)}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="pt-6 space-y-6">
          {/* Trend analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Rule Effectiveness Trends</CardTitle>
              <CardDescription>How rule efficiency has changed over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottom', offset: -5 }} />
                    <YAxis yAxisId="left" label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 'dataMax + 5']} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="accuracy" name="Accuracy (%)" stroke="var(--primary)" strokeWidth={2} />
                    <Line yAxisId="left" type="monotone" dataKey="actionRate" name="Action Rate (%)" stroke="var(--primary-foreground)" strokeWidth={2} dot={false} strokeDasharray="3 3" />
                    <Line yAxisId="right" type="monotone" dataKey="falsePositives" name="False Positives" stroke="var(--destructive)" />
                    <Line yAxisId="right" type="monotone" dataKey="matches" name="Matches" stroke="var(--muted-foreground)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {renderModeratorPerformance()}
        </TabsContent>
      </Tabs>
      
      {/* Rule details dialog */}
      {renderRuleDetailsDialog()}
    </div>
  );
};
