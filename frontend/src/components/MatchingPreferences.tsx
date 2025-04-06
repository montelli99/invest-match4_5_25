import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface Props {
  onSave: (preferences: {
    minMatchPercentage: number;
    maxResults: number;
    includeRoles: string[];
    excludePreviouslyMatched: boolean;
  }) => void;
  initialPreferences?: {
    minMatchPercentage: number;
    maxResults: number;
    includeRoles: string[];
    excludePreviouslyMatched: boolean;
  };
}

export function MatchingPreferences({ onSave, initialPreferences }: Props) {
  const [preferences, setPreferences] = useState({
    minMatchPercentage: initialPreferences?.minMatchPercentage || 70,
    maxResults: initialPreferences?.maxResults || 10,
    includeRoles: initialPreferences?.includeRoles || [],
    excludePreviouslyMatched:
      initialPreferences?.excludePreviouslyMatched ?? true,
  });

  const handleSave = () => {
    onSave(preferences);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Matching Preferences</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Minimum Match Percentage</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={preferences.minMatchPercentage}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                minMatchPercentage: Number(e.target.value),
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Maximum Results</Label>
          <Input
            type="number"
            min={1}
            max={50}
            value={preferences.maxResults}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                maxResults: Number(e.target.value),
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Include Roles</Label>
          <Select
            value={preferences.includeRoles.join(",")}
            onValueChange={(value) =>
              setPreferences({
                ...preferences,
                includeRoles: value.split(",").filter(Boolean),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select roles to include" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fund_manager,limited_partner">
                Fund Managers & LPs
              </SelectItem>
              <SelectItem value="capital_raiser">
                Capital Raisers Only
              </SelectItem>
              <SelectItem value="fund_manager,limited_partner,capital_raiser">
                All Roles
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="exclude-matched"
            checked={preferences.excludePreviouslyMatched}
            onCheckedChange={(checked) =>
              setPreferences({
                ...preferences,
                excludePreviouslyMatched: checked,
              })
            }
          />
          <Label htmlFor="exclude-matched">
            Exclude Previously Matched Users
          </Label>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Preferences
        </Button>
      </div>
    </Card>
  );
}
