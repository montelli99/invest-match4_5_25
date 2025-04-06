import { useState, useCallback, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PatternMatchResult, RiskCategory } from "./ModeratorType";
import { toast } from "sonner";
import brain from "brain";
import { CheckCircle, AlertCircle, Info, HelpCircle } from "lucide-react";

/**
 * Props for PatternTestingManager component
 */
interface Props {
  token: { idToken: string };
}

/**
 * PatternTestingManager component - Tests and validates pattern matching
 */
export function PatternTestingManager({ token }: Props) {
  // State for pattern testing
  const [pattern, setPattern] = useState<string>("");
  const [testContent, setTestContent] = useState<string>("");
  const [isRegex, setIsRegex] = useState<boolean>(false);
  const [isIgnoreCase, setIsIgnoreCase] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [matchResult, setMatchResult] = useState<PatternMatchResult | null>(null);
  const [testHistory, setTestHistory] = useState<Array<{pattern: string, content: string, result: PatternMatchResult}>>([]);
  const [selectedCategory, setSelectedCategory] = useState<RiskCategory>(RiskCategory.HARASSMENT);
  
  // Test pattern against content
  const testPattern = useCallback(async () => {
    if (!pattern || !testContent) {
      toast.warning("Please enter both pattern and test content");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, we would call the API with the pattern and content
      // Here we're simulating the API response
      const response = await brain.test_pattern({
        pattern: isRegex ? pattern : pattern.split(",").map(p => p.trim()).join("|"),
        content: testContent,
        token: token
      });
      
      // Process the API response
      const data = await response.json();
      
      // If there was an actual API, it would return this structure
      // For now, we'll create a simulated result
      const simulatedResult: PatternMatchResult = {
        pattern: pattern,
        matches: data.matches || generateMatches(),
        is_regex: isRegex,
        match_count: data.match_count || Math.floor(Math.random() * 5),
        context_segments: data.context_segments || generateContextSegments()
      };
      
      setMatchResult(simulatedResult);
      
      // Add to history
      setTestHistory(prev => [
        { pattern, content: testContent, result: simulatedResult },
        ...prev.slice(0, 9) // Keep only the 10 most recent tests
      ]);
      
      if (simulatedResult.match_count > 0) {
        toast.success(`Found ${simulatedResult.match_count} matches!`);
      } else {
        toast.info("No matches found");
      }
    } catch (error) {
      console.error("Error testing pattern:", error);
      toast.error("Failed to test pattern");
    } finally {
      setIsLoading(false);
    }
  }, [pattern, testContent, isRegex, token]);
  
  // Simulate API results for demo purposes
  const generateMatches = () => {
    if (!testContent || !pattern) return [];
    
    // Simple simulation of pattern matching
    const patternList = pattern.split(",").map(p => p.trim());
    const matches: string[] = [];
    
    patternList.forEach(p => {
      const regex = new RegExp(isRegex ? p : p, isIgnoreCase ? 'gi' : 'g');
      let match;
      while ((match = regex.exec(testContent)) !== null) {
        matches.push(match[0]);
      }
    });
    
    return [...new Set(matches)]; // Remove duplicates
  };
  
  // Generate context segments for highlighting
  const generateContextSegments = () => {
    if (!testContent || !pattern) return [];
    
    const segments: string[] = [];
    const matches = generateMatches();
    
    matches.forEach(match => {
      const index = testContent.indexOf(match);
      if (index !== -1) {
        const start = Math.max(0, index - 20);
        const end = Math.min(testContent.length, index + match.length + 20);
        segments.push(testContent.substring(start, end));
      }
    });
    
    return segments;
  };
  
  // Display context with highlighted matches
  const HighlightedContent = ({ content, matches }: { content: string, matches: string[] }) => {
    if (!content || !matches.length) return <div className="text-muted-foreground">{content}</div>;
    
    let lastIndex = 0;
    const parts: JSX.Element[] = [];
    
    matches.forEach((match, matchIndex) => {
      const index = content.indexOf(match, lastIndex);
      if (index !== -1) {
        // Add text before the match
        if (index > lastIndex) {
          parts.push(<span key={`before-${matchIndex}`}>{content.substring(lastIndex, index)}</span>);
        }
        
        // Add highlighted match
        parts.push(
          <span key={`match-${matchIndex}`} className="bg-yellow-200 dark:bg-yellow-900 font-bold">
            {match}
          </span>
        );
        
        lastIndex = index + match.length;
      }
    });
    
    // Add any remaining text
    if (lastIndex < content.length) {
      parts.push(<span key="after">{content.substring(lastIndex)}</span>);
    }
    
    return <div className="whitespace-pre-wrap break-words">{parts}</div>;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Pattern Testing System</CardTitle>
        <CardDescription>
          Test and validate pattern matching before implementing moderation rules
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="editor" className="space-y-4">
          <TabsList>
            <TabsTrigger value="editor">Pattern Editor</TabsTrigger>
            <TabsTrigger value="results">Test Results</TabsTrigger>
            <TabsTrigger value="history">Test History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pattern">Pattern</Label>
                  <div className="flex gap-2">
                    <Input
                      id="pattern"
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      placeholder={isRegex ? "Regular expression pattern" : "Comma-separated keywords"}
                    />
                    <Button variant="outline" size="icon" title="Help">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      id="regex-mode"
                      checked={isRegex}
                      onCheckedChange={setIsRegex}
                    />
                    <Label htmlFor="regex-mode">Regex Mode</Label>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      id="ignore-case"
                      checked={isIgnoreCase}
                      onCheckedChange={setIsIgnoreCase}
                    />
                    <Label htmlFor="ignore-case">Ignore Case</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Risk Category</Label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as RiskCategory)}
                    className="w-full rounded-md border border-input px-3 py-2"
                  >
                    {Object.values(RiskCategory).map((category) => (
                      <option key={category} value={category}>
                        {category.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Alert variant="outline">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Pattern Tips</AlertTitle>
                  <AlertDescription>
                    {isRegex ? (
                      <ul className="list-disc pl-4 text-sm">
                        <li>Use <code className="bg-muted p-1 rounded">\b</code> for word boundaries</li>
                        <li>Use <code className="bg-muted p-1 rounded">[a-z]</code> for character ranges</li>
                        <li>Use <code className="bg-muted p-1 rounded">.*</code> for wildcards</li>
                        <li>Use <code className="bg-muted p-1 rounded">|</code> for OR conditions</li>
                      </ul>
                    ) : (
                      <ul className="list-disc pl-4 text-sm">
                        <li>Separate keywords with commas</li>
                        <li>Keywords will be joined with OR</li>
                        <li>Use quotes for phrases with spaces</li>
                      </ul>
                    )}
                  </AlertDescription>
                </Alert>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-content">Test Content</Label>
                  <Textarea
                    id="test-content"
                    value={testContent}
                    onChange={(e) => setTestContent(e.target.value)}
                    placeholder="Enter content to test against the pattern"
                    className="min-h-[200px]"
                  />
                </div>
                
                <Button 
                  onClick={testPattern} 
                  disabled={isLoading || !pattern || !testContent} 
                  className="w-full"
                >
                  {isLoading ? "Testing..." : "Test Pattern"}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4">
            {matchResult ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Test Results</h3>
                  <Badge variant={matchResult.match_count > 0 ? "destructive" : "secondary"}>
                    {matchResult.match_count} matches found
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="font-medium">Pattern:</h4>
                  <code className="bg-muted p-2 rounded block">{matchResult.pattern} {matchResult.is_regex ? "(regex)" : "(keywords)"}</code>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Matches:</h4>
                  {matchResult.matches.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {matchResult.matches.map((match, index) => (
                        <Badge key={index} variant="outline">{match}</Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">No matches found</div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Context:</h4>
                  {matchResult.context_segments.length > 0 ? (
                    <div className="space-y-2 border rounded-md p-2">
                      {matchResult.context_segments.map((segment, index) => (
                        <div key={index} className="border-b last:border-b-0 py-2">
                          <HighlightedContent content={segment} matches={matchResult.matches} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">No context segments available</div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                  {matchResult.match_count > 0 ? (
                    <>
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <span>This content would be flagged based on the pattern.</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>This content would pass moderation.</span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No test results yet. Run a pattern test to see results here.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            {testHistory.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Test History</h3>
                
                <div className="space-y-2">
                  {testHistory.map((item, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader className="py-2">
                        <div className="flex justify-between items-center">
                          <code className="font-semibold">{item.pattern}</code>
                          <Badge variant={item.result.match_count > 0 ? "destructive" : "secondary"}>
                            {item.result.match_count} matches
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="line-clamp-2 text-sm text-muted-foreground">
                          <HighlightedContent content={item.content.substring(0, 100)} matches={item.result.matches} />
                        </div>
                      </CardContent>
                      <CardFooter className="py-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setPattern(item.pattern);
                            setTestContent(item.content);
                            setMatchResult(item.result);
                          }}
                        >
                          Reuse Test
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No test history available. Run pattern tests to see history here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => {
          setPattern("");
          setTestContent("");
          setMatchResult(null);
        }}>
          Clear Test
        </Button>
        <Button disabled={!matchResult || matchResult.match_count === 0}>
          Create Rule from Pattern
        </Button>
      </CardFooter>
    </Card>
  );
}
