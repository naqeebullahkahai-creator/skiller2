import { cn } from "@/lib/utils";
import { memo } from "react";

interface ProductCardSkeletonProps {
  className?: string;
}

const ProductCardSkeleton = memo(({ className }: ProductCardSkeletonProps) => {
  return (
    <div className={cn("bg-card rounded-lg overflow-hidden border border-border", className)}>
      {/* Image Skeleton - GPU accelerated animation */}
      <div className="aspect-square relative overflow-hidden bg-muted">
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/5 to-muted bg-[length:200%_100%]" />
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Brand */}
        <div className="h-3 w-16 bg-muted rounded animate-pulse" />
        
        {/* Title */}
        <div className="space-y-1.5">
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-muted rounded animate-pulse" />
          <div className="h-3 w-12 bg-muted rounded animate-pulse" />
        </div>
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 bg-muted rounded animate-pulse" />
          <div className="h-3 w-14 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
});

ProductCardSkeleton.displayName = "ProductCardSkeleton";

export default ProductCardSkeleton;
