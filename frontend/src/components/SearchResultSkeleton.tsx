import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  className?: string;
}

export function SearchResultSkeleton({ className = "" }: Props) {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
        <div className="text-right">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-12 mt-1" />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[180px]" />
        <Skeleton className="h-4 w-[160px]" />
        <Skeleton className="h-4 w-[220px]" />
        <Skeleton className="h-4 w-[190px]" />
      </div>

      <div className="flex gap-2 mt-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </Card>
  );
}
