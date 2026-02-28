import { useEffect, useRef, useCallback, memo } from "react";
import MobileProductCard from "@/components/mobile/MobileProductCard";
import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";
import { FanzonSpinner } from "@/components/ui/fanzon-spinner";
import { PackageOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ProductSkeleton = () => (
  <div className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-1)' }}>
    <Skeleton className="aspect-square w-full" />
    <div className="p-2 space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-2 w-1/3" />
    </div>
  </div>
);

const InfiniteProductGrid = memo(() => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteProducts();

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin: "200px",
      threshold: 0.1,
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [handleObserver]);

  const allProducts = data?.pages.flatMap((page) => page.products) || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <PackageOpen className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="text-[14px] font-medium text-foreground">Failed to load</p>
        <p className="text-[12px] text-muted-foreground">Please try again later</p>
      </div>
    );
  }

  if (allProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <PackageOpen className="w-12 h-12 text-primary mb-3" />
        <p className="text-[16px] font-semibold text-foreground">No products yet</p>
        <p className="text-[12px] text-muted-foreground">Check back soon!</p>
      </div>
    );
  }

  return (
    <>
      {/* 2-column grid, 8px gap */}
      <div className="grid grid-cols-2 gap-2">
        {allProducts.map((product) => (
          <MobileProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="flex items-center justify-center py-8">
        {isFetchingNextPage && <FanzonSpinner size="md" />}
        {!hasNextPage && allProducts.length > 0 && (
          <p className="text-[12px] text-muted-foreground">You've seen all products</p>
        )}
      </div>
    </>
  );
});

InfiniteProductGrid.displayName = "InfiniteProductGrid";

export default InfiniteProductGrid;
