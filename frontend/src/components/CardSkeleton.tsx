import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  className?: string;
}

export function CardSkeleton({ className = "" }: Props) {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-6 w-[150px]" />
        </div>
      </div>
    </Card>
  );
}
