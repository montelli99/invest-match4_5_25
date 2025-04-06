import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface Props {
  status: "sent" | "delivered" | "read";
  className?: string;
}

export function MessageStatus({ status, className }: Props) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {/* First check mark */}
      <CheckIcon
        className={cn(
          "h-3 w-3",
          status === "sent" ? "text-muted-foreground" : "text-primary",
        )}
      />
      {/* Second check mark for delivered/read */}
      {(status === "delivered" || status === "read") && (
        <CheckIcon
          className={cn(
            "h-3 w-3 -ml-1",
            status === "read" ? "text-primary" : "text-muted-foreground",
          )}
        />
      )}
    </div>
  );
}
