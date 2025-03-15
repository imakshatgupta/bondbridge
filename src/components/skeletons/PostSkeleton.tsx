import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PostSkeleton() {
  return (
    <Card className="rounded-none border-x-0 border-t-0 shadow-none mb-4">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {/* Avatar skeleton */}
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            {/* Username skeleton */}
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        {/* Three dots menu skeleton */}
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      
      <CardContent>
        {/* Caption skeleton */}
        <Skeleton className="h-4 w-full max-w-[300px] mb-4" />
        
        {/* Image skeleton */}
        <Skeleton className="w-full h-[300px] rounded-lg mb-4" />
        
        {/* Actions skeleton */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            {/* Like button skeleton */}
            <Skeleton className="h-8 w-16 rounded-full" />
            {/* Comment button skeleton */}
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
          {/* Time skeleton */}
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  );
} 