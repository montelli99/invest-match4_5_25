import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface ActionParameter {
  duration?: number;
  reason?: string;
  notification?: string;
  review_required: boolean;
}

interface Props {
  template: string;
  parameters: ActionParameter;
  onParametersChange: (parameters: ActionParameter) => void;
}

export const ActionTemplateConfig: React.FC<Props> = ({
  template,
  parameters,
  onParametersChange,
}) => {
  const handleChange = (field: keyof ActionParameter, value: any) => {
    onParametersChange({
      ...parameters,
      [field]: value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg capitalize">{template} Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {template !== "flag" && (
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (hours)</Label>
            <Input
              id="duration"
              type="number"
              value={parameters.duration || ""}
              onChange={(e) => handleChange("duration", parseInt(e.target.value) || 0)}
              placeholder="Enter duration in hours"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="reason">Reason</Label>
          <Textarea
            id="reason"
            value={parameters.reason || ""}
            onChange={(e) => handleChange("reason", e.target.value)}
            placeholder="Enter reason for action"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notification">Notification Message</Label>
          <Textarea
            id="notification"
            value={parameters.notification || ""}
            onChange={(e) => handleChange("notification", e.target.value)}
            placeholder="Enter notification message"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="review"
            checked={parameters.review_required}
            onCheckedChange={(checked) => handleChange("review_required", checked)}
          />
          <Label htmlFor="review">Require Manual Review</Label>
        </div>
      </CardContent>
    </Card>
  );
};
