import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import brain from "brain";

interface Props {
  rules: Array<{ id: string; is_active: boolean }>;
  onOperationComplete: () => void;
}

export const BatchOperationControls: React.FC<Props> = ({ rules, onOperationComplete }) => {
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  const [operation, setOperation] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSelectAll = () => {
    if (selectedRules.length === rules.length) {
      setSelectedRules([]);
    } else {
      setSelectedRules(rules.map((rule) => rule.id));
    }
  };

  const handleRuleSelect = (ruleId: string) => {
    setSelectedRules((prev) =>
      prev.includes(ruleId)
        ? prev.filter((id) => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  const handleOperation = async () => {
    if (!operation || selectedRules.length === 0) {
      toast.error("Please select an operation and at least one rule");
      return;
    }

    setLoading(true);
    try {
      const response = await brain.batch_update_rules({
        rule_ids: selectedRules,
        operation,
        parameters: {},
        token: {}
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        onOperationComplete();
      } else {
        toast.error("Operation failed");
      }
    } catch (error) {
      toast.error("Failed to perform batch operation");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
          className="whitespace-nowrap"
        >
          {selectedRules.length === rules.length ? "Deselect All" : "Select All"}
        </Button>

        <Select
          value={operation}
          onValueChange={setOperation}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select operation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="activate">Activate Rules</SelectItem>
            <SelectItem value="deactivate">Deactivate Rules</SelectItem>
            <SelectItem value="update_priority">Update Priority</SelectItem>
            <SelectItem value="update_category">Update Category</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={handleOperation}
          disabled={loading || selectedRules.length === 0 || !operation}
        >
          {loading ? "Processing..." : "Apply"}
        </Button>
      </div>

      <div className="space-y-2">
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center space-x-2">
            <Checkbox
              checked={selectedRules.includes(rule.id)}
              onCheckedChange={() => handleRuleSelect(rule.id)}
            />
            <span>Rule {rule.id}</span>
            <span className="text-sm text-muted-foreground">
              ({rule.is_active ? "Active" : "Inactive"})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
