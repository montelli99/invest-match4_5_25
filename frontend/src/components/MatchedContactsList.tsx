import { Button } from "@/components/ui/button";
import { GlobalMatchingDialog } from "@/components/GlobalMatchingDialog";
import { Card } from "@/components/ui/card";
import brain from "brain";
import { MessageCircle, Users } from "lucide-react";
import * as React from "react";

// The Match interface is already defined correctly below

interface Match {
  profile: {
    name: string;
    email: string;
    company: string;
    role: string;
    fund_type?: string;
    fund_size?: number;
    investment_focus?: string[];
    historical_returns?: number;
    risk_profile?: string;
  };
  match_percentage: number;
  compatibility_factors: string[];
  potential_synergies: string[];
}

interface Props {
  onMessageClick: (user: {
    uid: string;
    display_name: string;
    company_name?: string;
  }) => void;
}

export function MatchedContactsList({ onMessageClick }: Props) {
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");
  const [showSettings, setShowSettings] = React.useState(false);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await brain.get_user_matches({ user_id: "current_user" });
      const data = await response.json();
      setMatches(data);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMatches();
  }, []);

  const handleRefresh = () => {
    fetchMatches();
  };

  if (loading) {
    return (
    <>
      <GlobalMatchingDialog
        open={showSettings}
        onOpenChange={(open) => {
          setShowSettings(open);
          if (!open) {
            // Refresh the matches list when settings dialog is closed
            handleRefresh();
          }
        }}
      />
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    </>
  );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => fetchMatches()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground space-y-4">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No matched contacts yet</p>
        <p className="text-sm">
          Enable global matching to see potential connections
        </p>
        <Button
          variant="outline"
          onClick={() => setShowSettings(true)}
          className="mt-2"
        >
          Enable Global Matching
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Matched Contacts</h3>
          <p className="text-sm text-muted-foreground">
            {matches.length} potential {matches.length === 1 ? "match" : "matches"} found
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            Matching Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </div>
      </div>
      {matches.map((match) => (
        <Card
          key={match.profile.email}
          className="p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {match.profile.name
                    ? match.profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "?"}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{match.profile.name}</h4>
                  <span className="text-sm text-primary font-medium rounded-full px-2 py-0.5 bg-primary/10">
                    {Math.round(match.match_percentage)}% Match
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {match.profile.role} at {match.profile.company}
                </p>
                <div className="mt-2 space-y-2">
                  <div>
                    <h5 className="text-sm font-medium">Compatibility Factors:</h5>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {match.compatibility_factors.map((factor) => (
                        <span
                          key={factor}
                          className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5"
                        >
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {match.profile.fund_type && (
                    <div>
                      <h5 className="text-sm font-medium">Fund Type:</h5>
                      <p className="text-sm">{match.profile.fund_type}</p>
                    </div>
                  )}
                  
                  {match.profile.fund_size && (
                    <div>
                      <h5 className="text-sm font-medium">Fund Size:</h5>
                      <p className="text-sm">
                        ${(match.profile.fund_size / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  )}
                  
                  {match.profile.investment_focus && match.profile.investment_focus.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium">Investment Focus:</h5>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {match.profile.investment_focus.map((focus) => (
                          <span
                            key={focus}
                            className="text-xs bg-secondary/10 text-secondary-foreground rounded-full px-2 py-0.5"
                          >
                            {focus}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h5 className="text-sm font-medium">Potential Synergies:</h5>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {match.potential_synergies.map((synergy) => (
                        <span
                          key={synergy}
                          className="text-xs bg-secondary/10 text-secondary-foreground rounded-full px-2 py-0.5"
                        >
                          {synergy}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onMessageClick({
                  uid: match.profile.email,
                  display_name: match.profile.name,
                  company_name: match.profile.company,
                })
              }
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
