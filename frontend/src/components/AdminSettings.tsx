import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DataTable } from "components/DataTable";
import { useModerationRules } from "utils/admin";

export function AdminSettings() {
  const { rules, isLoading, error } = useModerationRules();
  const [newRule, setNewRule] = useState({
    pattern: "",
    action: "flag",
    severity: "medium",
  });

  const handleAddRule = async () => {
    // TODO: Implement rule creation
    console.log("Adding rule:", newRule);
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Moderation Rules</h3>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pattern">Pattern</Label>
              <Input
                id="pattern"
                value={newRule.pattern}
                onChange={(e) =>
                  setNewRule({ ...newRule, pattern: e.target.value })
                }
                placeholder="Enter regex pattern or keywords"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <select
                id="action"
                value={newRule.action}
                onChange={(e) =>
                  setNewRule({ ...newRule, action: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="flag">Flag for Review</option>
                <option value="block">Block Content</option>
                <option value="warn">Show Warning</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <select
                id="severity"
                value={newRule.severity}
                onChange={(e) =>
                  setNewRule({ ...newRule, severity: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleAddRule}>Add Rule</Button>
            </div>
          </div>

          <DataTable
            columns={[
              { key: "pattern", label: "Pattern" },
              { key: "action", label: "Action" },
              { key: "severity", label: "Severity" },
              {
                key: "is_active",
                label: "Active",
                render: (value) => (
                  <Switch checked={value} disabled aria-label="Rule status" />
                ),
              },
            ]}
            data={rules}
            isLoading={isLoading}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive email notifications for new reports
              </p>
            </div>
            <Switch defaultChecked aria-label="Toggle email notifications" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>High Priority Alerts</Label>
              <p className="text-sm text-gray-500">
                Get immediate alerts for high severity reports
              </p>
            </div>
            <Switch defaultChecked aria-label="Toggle priority alerts" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Daily Summary</Label>
              <p className="text-sm text-gray-500">
                Receive daily summary of moderation activities
              </p>
            </div>
            <Switch aria-label="Toggle daily summary" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Auto-Moderation</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>AI-Powered Moderation</Label>
              <p className="text-sm text-gray-500">
                Use AI to automatically detect and flag inappropriate content
              </p>
            </div>
            <Switch defaultChecked aria-label="Toggle AI moderation" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Block Known Patterns</Label>
              <p className="text-sm text-gray-500">
                Automatically block content matching known harmful patterns
              </p>
            </div>
            <Switch defaultChecked aria-label="Toggle auto-block" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Learning Mode</Label>
              <p className="text-sm text-gray-500">
                Improve auto-moderation by learning from manual reviews
              </p>
            </div>
            <Switch aria-label="Toggle learning mode" />
          </div>
        </div>
      </Card>
    </div>
  );
}
