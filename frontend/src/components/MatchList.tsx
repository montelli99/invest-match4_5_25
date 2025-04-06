import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { MessageDialog } from "./MessageDialog";

interface MatchProfile {
  email: string;
  name: string;
  company: string;
  role: string;
  fund_type?: string;
  fund_size?: number;
  investment_focus?: string[];
  years_experience?: number;
  sectors?: string[];
}

interface Match {
  profile: MatchProfile;
  match_percentage: number;
  compatibility_factors: string[];
  potential_synergies: string[];
}

interface Props {
  matches: Match[];
  onViewProfile: (profile: MatchProfile) => void;
}

export function MatchList({ matches, onViewProfile }: Props) {
  const [selectedUser, setSelectedUser] = useState<{
    uid: string;
    display_name: string;
    company_name: string;
  } | null>(null);

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <Card
          key={match.profile.email}
          className="p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold">{match.profile.name}</h3>
              <p className="text-muted-foreground">{match.profile.company}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {Math.round(match.match_percentage)}%
              </div>
              <div className="text-sm text-muted-foreground">Match</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Profile Details</h4>
              <div className="space-y-1">
                <p>
                  <span className="font-medium">Role:</span>{" "}
                  {match.profile.role}
                </p>
                {match.profile.fund_type && (
                  <p>
                    <span className="font-medium">Fund Type:</span>{" "}
                    {match.profile.fund_type}
                  </p>
                )}
                {match.profile.fund_size && (
                  <p>
                    <span className="font-medium">Fund Size:</span> $
                    {match.profile.fund_size}M
                  </p>
                )}
                {match.profile.years_experience && (
                  <p>
                    <span className="font-medium">Experience:</span>{" "}
                    {match.profile.years_experience} years
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Compatibility Factors</h4>
              <div className="flex flex-wrap gap-2">
                {match.compatibility_factors.map((factor) => (
                  <Badge key={factor} variant="secondary">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Potential Synergies</h4>
              <div className="flex flex-wrap gap-2">
                {match.potential_synergies.map((synergy) => (
                  <Badge key={synergy} variant="outline">
                    {synergy}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => onViewProfile(match.profile)}
            >
              View Profile
            </Button>
            <Button
              className="flex-1"
              onClick={() =>
                setSelectedUser({
                  uid: match.profile.email,
                  display_name: match.profile.name,
                  company_name: match.profile.company,
                })
              }
            >
              Message
            </Button>
          </div>
        </Card>
      ))}

      {matches.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No matches found. Try adjusting your preferences.
        </div>
      )}

      {selectedUser && (
        <MessageDialog
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          otherUser={selectedUser}
        />
      )}
    </div>
  );
}
