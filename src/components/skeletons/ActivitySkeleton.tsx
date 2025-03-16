import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function CommunitySkeleton() {
  return (
    <Card className="p-4 flex flex-col items-center justify-center">
      <Skeleton className="h-16 w-16 rounded-full mb-2" />
      <Skeleton className="h-5 w-24 mb-1" />
      <Skeleton className="h-4 w-16" />
    </Card>
  );
}

export function SuggestedCommunitiesSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <CommunitySkeleton key={index} />
      ))}
    </div>
  );
}

export function ChatItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 border-b">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-32 mb-1" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex flex-col items-end">
        <Skeleton className="h-4 w-12 mb-1" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
    </div>
  );
}

export function ChatListSkeleton() {
  return (
    <div className="space-y-1 border rounded-md">
      {Array.from({ length: 5 }).map((_, index) => (
        <ChatItemSkeleton key={index} />
      ))}
    </div>
  );
} 