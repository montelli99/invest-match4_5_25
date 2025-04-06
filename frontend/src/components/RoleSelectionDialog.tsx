import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BarChart3, Briefcase, Users } from "lucide-react";
import * as React from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleSelect: (
    role: "fund-manager" | "limited-partner" | "capital-raiser",
  ) => void;
}

export function RoleSelectionDialog({
  open,
  onOpenChange,
  onRoleSelect,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Choose Your Role</DialogTitle>
          <DialogDescription>
            Select the role that best describes you to get a personalized
            onboarding experience.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <button
            onClick={() => onRoleSelect("fund-manager")}
            className="flex items-start gap-4 p-4 rounded-lg border hover:border-primary transition-colors text-left"
          >
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Fund Manager</h4>
              <p className="text-sm text-muted-foreground">
                Showcase your fund's performance and connect with qualified
                investors.
              </p>
            </div>
          </button>

          <button
            onClick={() => onRoleSelect("limited-partner")}
            className="flex items-start gap-4 p-4 rounded-lg border hover:border-primary transition-colors text-left"
          >
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Limited Partner</h4>
              <p className="text-sm text-muted-foreground">
                Find investment opportunities that match your criteria and risk
                tolerance.
              </p>
            </div>
          </button>

          <button
            onClick={() => onRoleSelect("capital-raiser")}
            className="flex items-start gap-4 p-4 rounded-lg border hover:border-primary transition-colors text-left"
          >
            <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Capital Raiser</h4>
              <p className="text-sm text-muted-foreground">
                Leverage your network and facilitate valuable connections.
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
