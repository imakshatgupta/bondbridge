import { Skeleton } from "@/components/ui/skeleton";

export function NotificationSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      {/* Avatar skeleton */}
      <div className="w-12 h-12">
        <Skeleton className="w-full h-full rounded-full" />
      </div>
      
      <div className="flex-1">
        {/* Title skeleton */}
        <Skeleton className="h-6 w-48 mb-2" />
        
        {/* Description skeleton */}
        <Skeleton className="h-4 w-full max-w-[250px]" />
      </div>
      
      {/* Timestamp skeleton */}
      <Skeleton className="h-4 w-16" />
      
      {/* Unread indicator skeleton */}
      <Skeleton className="h-2 w-2 rounded-full" />
    </div>
  );
}

export function NotificationsListSkeleton() {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, index) => (
        <NotificationSkeleton key={index} />
      ))}
    </div>
  );
} 