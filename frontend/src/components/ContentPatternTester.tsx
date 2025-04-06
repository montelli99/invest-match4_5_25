import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import brain from "brain";

interface PatternResult {
  matches: boolean;
  score: number;
  classification: string;
  highlightedContent?: string;
  matchDetails?: {
    pattern: string;
    matchLocations: number[];
  }[];
}

interface Props {
  onPatternTested?: (result: PatternResult) => void;
}

const ContentPatternTester: React.FC<Props> = ({ onPatternTested }) => {
  const [tab, setTab] = useState("test");
  const [content, setContent] = useState("");
  const [pattern, setPattern] = useState("");
  const [threshold, setThreshold] = useState([50]);
  const [result, setResult] = useState<PatternResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedPatterns, setSavedPatterns] = useState<{name: string, pattern: string}[]>([
    { name: "Personal Information", pattern: "\\b\\d{3}[.-]?\\d{2}[.-]?\\d{4}\\b|\\b\\d{9}\\b" },
    { name: "Email Addresses", pattern: "[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}" },
    { name: "URLs", pattern: "https?:\\/\\/[\\w\\d.-]+\\.[a-zA-Z]{2,}(?:\\/[\\w\\d.-]*)*" },
    { name: "Profanity", pattern: "\\b(bad|terrible|awful)\\b" }, // Simplified example
  ]);

  const testPattern = async () => {
    if (!content || !pattern) {
      toast.error("Please provide both content and pattern to test");
      return;
    }

    setLoading(true);
    
    try {
      // First try the API call
      const response = await brain.test_pattern({
        content,
        pattern,
        threshold: threshold[0] / 100
      });
      
      const data = await response.json();
      
      setResult({
        matches: data.matches,
        score: data.score * 100, // Convert to percentage
        classification: data.classification || "Unclassified",
        highlightedContent: data.highlighted_content,
        matchDetails: data.match_details
      });
      
      if (onPatternTested) {
        onPatternTested({
          matches: data.matches,
          score: data.score * 100,
          classification: data.classification || "Unclassified"
        });
      }
      
      if (data.matches) {
        toast.success("Pattern matched!");
      } else {
        toast.info("Pattern did not match within threshold");
      }
    } catch (error) {
      console.error("Error testing pattern:", error);
      
      // Fallback to client-side pattern testing if API fails
      try {
        const regex = new RegExp(pattern, "gi");
        const matches = content.match(regex);
        const matchFound = matches !== null && matches.length > 0;
        
        // Simple client-side calculation
        const score = matchFound ? 85 : 0;
        
        setResult({
          matches: matchFound,
          score: score,
          classification: matchFound ? "Potential Violation" : "Safe Content"
        });
        
        if (onPatternTested) {
          onPatternTested({
            matches: matchFound,
            score: score,
            classification: matchFound ? "Potential Violation" : "Safe Content"
          });
        }
        
        if (matchFound) {
          toast.success("Pattern matched! (Client-side fallback)");
        } else {
          toast.info("Pattern did not match (Client-side fallback)");
        }
      } catch (regexError) {
        toast.error("Invalid regular expression pattern");
        setResult(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const savePattern = () => {
    if (!pattern) {
      toast.error("Please provide a pattern to save");
      return;
    }
    
    const patternName = prompt("Enter a name for this pattern:");
    if (!patternName) return;
    
    setSavedPatterns([...savedPatterns, { name: patternName, pattern }]);
    toast.success(`Pattern "${patternName}" saved successfully`);
  };

  const loadPattern = (savedPattern: string) => {
    const selected = savedPatterns.find(p => p.pattern === savedPattern);
    if (selected) {
      setPattern(selected.pattern);
      toast.info(`Loaded pattern: ${selected.name}`);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Content Pattern Tester</CardTitle>
        <CardDescription>
          Test regex patterns against content to develop effective moderation rules
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="test">Test Pattern</TabsTrigger>
            <TabsTrigger value="library">Pattern Library</TabsTrigger>
          </TabsList>
          
          <TabsContent value="test" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pattern">Regex Pattern</Label>
              <Input
                id="pattern"
                placeholder="Enter regex pattern..."
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="threshold">Match Threshold ({threshold[0]}%)</Label>
              </div>
              <Slider
                id="threshold"
                min={0}
                max={100}
                step={1}
                value={threshold}
                onValueChange={setThreshold}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Content to Test</Label>
              <Textarea
                id="content"
                placeholder="Enter content to test against the pattern..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
            </div>
            
            {result && (
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Result:</h4>
                  <Badge 
                    variant={result.matches ? "destructive" : "outline"}
                  >
                    {result.matches ? "Matched" : "No Match"}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm">Score: {result.score.toFixed(1)}%</div>
                  <div className="text-sm">Classification: {result.classification}</div>
                </div>
                
                {result.highlightedContent && (
                  <div className="mt-2">
                    <Label>Highlighted Matches:</Label>
                    <div 
                      className="mt-1 p-2 bg-muted rounded text-sm overflow-auto max-h-32" 
                      dangerouslySetInnerHTML={{ __html: result.highlightedContent }}
                    />
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="library" className="space-y-4">
            <div className="space-y-2">
              <Label>Saved Patterns</Label>
              <div className="grid grid-cols-1 gap-2">
                {savedPatterns.map((p, i) => (
                  <div key={i} className="flex justify-between items-center p-2 border rounded-md">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-muted-foreground font-mono">{p.pattern}</div>
                    </div>
                    <Button variant="outline" onClick={() => loadPattern(p.pattern)}>
                      Load
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={savePattern} disabled={!pattern}>
          Save Pattern
        </Button>
        <Button onClick={testPattern} disabled={loading || !content || !pattern}>
          {loading ? "Testing..." : "Test Pattern"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export { ContentPatternTester };