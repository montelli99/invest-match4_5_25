import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthWrapper";
import brain from "brain";

interface PatternMatch {
  start: number;
  end: number;
  matched_text: string;
}

interface Props {
  onValidPattern?: (pattern: string) => void;
  initialPattern?: string;
}

export const PatternTester = ({ onValidPattern, initialPattern = "" }: Props) => {
  const [pattern, setPattern] = useState(initialPattern);
  const [content, setContent] = useState("");
  const [matches, setMatches] = useState<PatternMatch[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState("");
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const testPattern = async () => {
    if (!pattern || !content) {
      toast({
        title: "Error",
        description: "Please provide both pattern and test content",
        variant: "destructive",
      });
      return;
    }

    try {
      setTesting(true);
      console.log("Testing pattern:", { pattern, content });
      
      // Use the test_pattern_v1 endpoint
      // Use the test_pattern_v1 endpoint for pattern testing
      const response = await brain.test_pattern_v1({
        pattern,
        content,
        threshold: 0.7
      });
      const data = await response.json();
      console.log("Pattern test response:", data);
      
      // Process matches from the moderation_settings_v1 API format
      if (data.matches && Array.isArray(data.matches)) {
        setMatches(data.matches.map(match => ({
          start: typeof match.start === 'number' ? match.start : 0,
          end: typeof match.end === 'number' ? match.end : 0,
          matched_text: typeof match.matched_text === 'string' ? match.matched_text : ''
        })));
      } else {
        setMatches([]);
      }
      
      console.log("Matches found:", data.matches || []);
      setIsValid(data.is_valid !== false);
      setError(data.error || "");

      if (data.is_valid && onValidPattern) {
        onValidPattern(pattern);
      }
    } catch (error) {
      console.error("Pattern test error:", error);
      toast({
        title: "Error",
        description: "Failed to test pattern",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const renderHighlightedContent = () => {
    if (!matches.length) return content;

    let result = [];
    let lastIndex = 0;

    // Sort matches by start index
    const sortedMatches = [...matches].sort((a, b) => a.start - b.start);

    sortedMatches.forEach((match, index) => {
      // Add text before match
      if (match.start > lastIndex) {
        result.push(
          <span key={`text-${index}`}>
            {content.slice(lastIndex, match.start)}
          </span>
        );
      }

      // Add highlighted match
      result.push(
        <span
          key={`match-${index}`}
          className="bg-yellow-200 dark:bg-yellow-800"
          title={`Match ${index + 1}`}
        >
          {match.matched_text}
        </span>
      );

      lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      result.push(
        <span key="text-end">{content.slice(lastIndex)}</span>
      );
    }

    return result;
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Enter regex pattern"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={testPattern}
            disabled={testing || !pattern || !content}
          >
            {testing ? "Testing..." : "Test Pattern"}
          </Button>
        </div>

        <Textarea
          placeholder="Enter test content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />
      </div>

      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {matches.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="font-semibold">
                Found {matches.length} match{matches.length !== 1 ? "es" : ""}
              </p>
              <div className="whitespace-pre-wrap">
                {renderHighlightedContent()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
