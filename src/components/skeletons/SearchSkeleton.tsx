import { Skeleton } from "@/components/ui/skeleton";
 
 export function SearchResultSkeleton() {
   return (
     <div className="flex items-center gap-3 p-2">
       {/* Avatar skeleton */}
       <Skeleton className="h-12 w-12 rounded-full" />
       
       <div className="flex-1">
         {/* Name skeleton */}
         <Skeleton className="h-5 w-32 mb-2" />
         
         {/* Username skeleton */}
         <Skeleton className="h-4 w-24" />
       </div>
       
       {/* Button skeleton */}
       <Skeleton className="h-9 w-24 rounded-full" />
     </div>
   );
 }
 
 export function SearchResultsListSkeleton() {
   return (
     <div className="space-y-4">
       {Array.from({ length: 5 }).map((_, index) => (
         <SearchResultSkeleton key={index} />
       ))}
     </div>
   );
 }