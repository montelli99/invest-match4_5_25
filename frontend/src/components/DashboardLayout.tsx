import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DashboardLayout as LayoutType,
  useDashboardStore,
} from "@/utils/dashboardStore";
import { Settings2 } from "lucide-react";
import * as React from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
}

const layoutOptions: { value: LayoutType; label: string }[] = [
  { value: "default", label: "Default View" },
  { value: "compact", label: "Compact View" },
  { value: "expanded", label: "Expanded View" },
];

export function DashboardLayout({ children, className = "" }: Props) {
  const { layout, setLayout } = useDashboardStore();

  const getLayoutClasses = () => {
    switch (layout) {
      case "compact":
        return "max-w-5xl mx-auto space-y-4";
      case "expanded":
        return "max-w-[90rem] mx-auto space-y-8";
      default:
        return "max-w-7xl mx-auto space-y-6";
    }
  };

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className={getLayoutClasses()}>
          <div className="py-4 px-4 sm:px-6 lg:px-8 flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Layout Settings
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {layoutOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setLayout(option.value)}
                    className={layout === option.value ? "bg-accent" : ""}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className={getLayoutClasses()}>{children}</div>
      </div>
    </div>
  );
}
