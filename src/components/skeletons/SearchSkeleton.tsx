import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function SearchResultSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
      <div className="flex items-center gap-3">
        {/* Avatar skeleton */}
        <Skeleton className="h-12 w-12 rounded-full" />
        
        <div className="space-y-2 w-full">
          {/* Name skeleton */}
          <Skeleton className="h-5 w-32" />
          
          {/* Bio skeleton */}
          <Skeleton className="h-4 w-full max-w-[250px]" />
          
          {/* Tags skeleton */}
          <div className="flex gap-2 mt-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Buttons skeleton */}
      <div className="flex gap-2 mt-2 sm:mt-0">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}

export function SearchResultsListSkeleton() {
  return (
    <Card className="p-2 border border-border mt-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="border-b border-border last:border-b-0">
          <SearchResultSkeleton />
        </div>
      ))}
    </Card>
  );
} 