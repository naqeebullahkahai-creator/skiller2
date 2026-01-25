import { useEffect, useRef, useCallback, memo } from "react";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/ui/product-card-skeleton";
import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";
import { FanzonSpinner } from "@/components/ui/fanzon-spinner";
import { PackageOpen, ArrowDown } from "lucide-react";

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
  const totalCount = data?.pages[0]?.totalCount || 0;

  if (isLoading) {
    return (
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
              <div className="h-4 w-32 bg-muted rounded mt-2 animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <PackageOpen className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load products</h3>
            <p className="text-muted-foreground">Please try again later</p>
          </div>
        </div>
      </section>
    );
  }

  if (allProducts.length === 0) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <PackageOpen className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No products yet</h3>
            <p className="text-muted-foreground">Check back soon for amazing deals!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              Just For You
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {totalCount} products available
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {allProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 4}
            />
          ))}
        </div>

        {/* Load More Trigger */}
        <div ref={loadMoreRef} className="flex flex-col items-center justify-center py-10">
          {isFetchingNextPage && (
            <div className="flex flex-col items-center gap-3">
              <FanzonSpinner size="md" />
              <p className="text-sm text-muted-foreground">Loading more...</p>
            </div>
          )}
          {!hasNextPage && allProducts.length > 0 && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <PackageOpen className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium">You've seen all products</p>
            </div>
          )}
          {hasNextPage && !isFetchingNextPage && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground animate-bounce">
              <ArrowDown className="w-5 h-5" />
              <p className="text-sm">Scroll for more</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

InfiniteProductGrid.displayName = "InfiniteProductGrid";

export default InfiniteProductGrid;
