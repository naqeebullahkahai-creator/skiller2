import { useEffect, useRef, useCallback, memo } from "react";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/ui/product-card-skeleton";
import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";
import FanzonSpinner from "@/components/ui/fanzon-spinner";

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

  // Intersection Observer for infinite scroll
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
      rootMargin: "200px", // Start loading 200px before reaching the end
      threshold: 0.1,
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [handleObserver]);

  // Flatten all pages into a single array
  const allProducts = data?.pages.flatMap((page) => page.products) || [];
  const totalCount = data?.pages[0]?.totalCount || 0;

  if (isLoading) {
    return (
      <section className="bg-secondary py-6">
        <div className="container mx-auto">
          <div className="bg-primary text-primary-foreground py-3 px-4 md:px-6 rounded-t-lg">
            <h2 className="text-lg md:text-xl font-bold text-center">Just For You</h2>
          </div>
          <div className="bg-card p-4 rounded-b-lg">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="bg-secondary py-6">
        <div className="container mx-auto">
          <div className="bg-primary text-primary-foreground py-3 px-4 md:px-6 rounded-t-lg">
            <h2 className="text-lg md:text-xl font-bold text-center">Just For You</h2>
          </div>
          <div className="bg-card p-4 rounded-b-lg text-center py-12 text-muted-foreground">
            Failed to load products. Please try again.
          </div>
        </div>
      </section>
    );
  }

  if (allProducts.length === 0) {
    return (
      <section className="bg-secondary py-6">
        <div className="container mx-auto">
          <div className="bg-primary text-primary-foreground py-3 px-4 md:px-6 rounded-t-lg">
            <h2 className="text-lg md:text-xl font-bold text-center">Just For You</h2>
          </div>
          <div className="bg-card p-4 rounded-b-lg text-center py-12 text-muted-foreground">
            No products available yet
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-secondary py-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-3 px-4 md:px-6 rounded-t-lg flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold">Just For You</h2>
          <span className="text-xs opacity-80">
            {allProducts.length} of {totalCount} products
          </span>
        </div>

        {/* Product Grid */}
        <div className="bg-card p-4 rounded-b-lg">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {allProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 6} // First 6 products load immediately
              />
            ))}
          </div>

          {/* Infinite Scroll Trigger */}
          <div ref={loadMoreRef} className="flex justify-center py-6">
            {isFetchingNextPage && (
              <div className="flex flex-col items-center gap-2">
                <FanzonSpinner size="md" />
                <span className="text-sm text-muted-foreground">Loading more...</span>
              </div>
            )}
            {!hasNextPage && allProducts.length > 0 && (
              <p className="text-sm text-muted-foreground">
                You've seen all {totalCount} products
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

InfiniteProductGrid.displayName = "InfiniteProductGrid";

export default InfiniteProductGrid;
