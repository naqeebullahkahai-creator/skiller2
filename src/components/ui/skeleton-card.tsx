import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-card rounded-lg overflow-hidden border border-border flex flex-col h-full">
      {/* Image Skeleton with branded shimmer */}
      <div className="aspect-square w-full skeleton-shimmer" />

      {/* Content Skeleton */}
      <div className="p-3 flex flex-col flex-1">
        {/* Brand */}
        <Skeleton className="h-3 w-16 mb-2" />
        
        {/* Title */}
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        
        {/* Rating */}
        <Skeleton className="h-3 w-20 mb-2" />
        
        {/* Price */}
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const FlashSaleSkeleton = () => {
  return (
    <section className="bg-card py-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4 px-4 md:px-0">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
        
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex gap-3 md:gap-4 pb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[160px] md:w-[200px]">
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const HeroSkeleton = () => {
  return (
    <div className="relative w-full">
      <div className="aspect-[21/9] w-full skeleton-shimmer rounded-lg" />
    </div>
  );
};

interface PageSkeletonProps {
  className?: string;
}

export const PageSkeleton = ({ className }: PageSkeletonProps) => {
  return (
    <div className={cn("space-y-4 animate-fade-in", className)}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-24" />
      </div>
      
      {/* Content skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-40 w-full skeleton-shimmer" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-3">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
};
