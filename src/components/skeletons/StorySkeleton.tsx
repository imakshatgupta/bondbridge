import { Skeleton } from "@/components/ui/skeleton";

export function StorySkeleton() {
  return (
    <div className="flex flex-col items-center space-y-1 mx-2 my-1">
      <Skeleton className="w-16 h-16 rounded-full" />
      <Skeleton className="w-12 h-3" />
    </div>
  );
}

export function StoryRowSkeleton() {
  return (
    <div className="mb-2 overflow-x-auto">
      <div className="flex gap-4 pb-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <StorySkeleton key={index} />
        ))}
      </div>
    </div>
  );
} 