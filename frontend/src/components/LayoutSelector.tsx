import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Layout, LayoutGrid, LayoutList } from "lucide-react";

export type DashboardLayout = "compact" | "detailed" | "grid";

interface Props {
  currentLayout: DashboardLayout;
  onLayoutChange: (layout: DashboardLayout) => void;
}

export function LayoutSelector({ currentLayout, onLayoutChange }: Props) {
  const layouts = [
    { id: "compact" as const, label: "Compact View", icon: LayoutList },
    { id: "detailed" as const, label: "Detailed View", icon: Layout },
    { id: "grid" as const, label: "Grid View", icon: LayoutGrid },
  ];

  const currentLayoutInfo = layouts.find((l) => l.id === currentLayout);
  const Icon = currentLayoutInfo?.icon || LayoutList;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLayoutInfo?.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {layouts.map((layout) => (
          <DropdownMenuItem
            key={layout.id}
            onClick={() => onLayoutChange(layout.id)}
            className="gap-2"
          >
            <layout.icon className="h-4 w-4" />
            {layout.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
