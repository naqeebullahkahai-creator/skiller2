import { cn } from "@/lib/utils";

interface ProductCardSkeletonProps {
  className?: string;
}

const ProductCardSkeleton = ({ className }: ProductCardSkeletonProps) => {
  return (
    <div className={cn("bg-card rounded-lg overflow-hidden border border-border", className)}>
      {/* Image Skeleton */}
      <div className="aspect-square relative overflow-hidden bg-muted">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent skeleton-shimmer" />
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Brand */}
        <div className="h-3 w-16 bg-muted rounded skeleton-shimmer" />
        
        {/* Title */}
        <div className="space-y-1.5">
          <div className="h-4 w-full bg-muted rounded skeleton-shimmer" />
          <div className="h-4 w-3/4 bg-muted rounded skeleton-shimmer" />
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-muted rounded skeleton-shimmer" />
          <div className="h-3 w-12 bg-muted rounded skeleton-shimmer" />
        </div>
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 bg-muted rounded skeleton-shimmer" />
          <div className="h-3 w-14 bg-muted rounded skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
