import { useEffect, useRef, useCallback, memo } from "react";
import MobileProductCard from "@/components/mobile/MobileProductCard";
import ProductCard from "@/components/product/ProductCard";
import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";
import { useIsMobile } from "@/hooks/use-mobile";
import { FanzonSpinner } from "@/components/ui/fanzon-spinner";
import { PackageOpen, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const ProductSkeleton = () => (
  <div className="bg-card rounded-2xl overflow-hidden border border-border/40">
    <Skeleton className="aspect-square w-full" />
    <div className="p-3 space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-2 w-1/3" />
    </div>
  </div>
);

const InfiniteProductGrid = memo(() => {
  const isMobile = useIsMobile();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
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
      <div className={isMobile ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"}>
        {Array.from({ length: isMobile ? 6 : 12 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <PackageOpen className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground">Failed to load products</p>
        <p className="text-xs text-muted-foreground mb-4">Please check your connection</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 rounded-xl">
          <RefreshCw size={14} />
          Try Again
        </Button>
      </div>
    );
  }

  if (allProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <PackageOpen className="w-8 h-8 text-primary" />
        </div>
        <p className="text-base font-bold text-foreground">No products yet</p>
        <p className="text-xs text-muted-foreground">Check back soon!</p>
      </div>
    );
  }

  return (
    <>
      <div className={isMobile ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"}>
        {allProducts.map((product) => (
          isMobile ? (
            <MobileProductCard key={product.id} product={product} />
          ) : (
            <ProductCard key={product.id} product={product} />
          )
        ))}
      </div>

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="flex items-center justify-center py-8">
        {isFetchingNextPage && <FanzonSpinner size="md" />}
        {!hasNextPage && allProducts.length > 0 && (
          <p className="text-xs text-muted-foreground bg-muted px-4 py-2 rounded-full">You've seen all products</p>
        )}
      </div>
    </>
  );
});

InfiniteProductGrid.displayName = "InfiniteProductGrid";

export default InfiniteProductGrid;
