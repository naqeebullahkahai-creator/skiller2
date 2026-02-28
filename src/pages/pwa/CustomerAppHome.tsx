import { lazy, Suspense, useCallback } from "react";
import MobileHeroBanner from "@/components/mobile/MobileHeroBanner";
import MobileCategoryScroll from "@/components/mobile/MobileCategoryScroll";
import PullToRefresh from "@/components/mobile/PullToRefresh";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";

const MobileFlashSale = lazy(() => import("@/components/mobile/MobileFlashSale"));
const InfiniteProductGrid = lazy(() => import("@/components/home/InfiniteProductGrid"));

const SectionSkeleton = () => (
  <div className="px-2 py-4">
    <div className="grid grid-cols-2 gap-2">
      {[1,2,3,4].map(i => (
        <div key={i} className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-1)' }}>
          <Skeleton className="aspect-square w-full" />
          <div className="p-2 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CustomerAppHome = () => {
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries();
  }, [queryClient]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="page-enter">
        <MobileHeroBanner />
        <MobileCategoryScroll />

        <Suspense fallback={<SectionSkeleton />}>
          <MobileFlashSale />
        </Suspense>

        <section className="bg-card mt-2">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <h2 className="font-bold text-[16px] text-foreground">Just For You</h2>
          </div>
          <div className="p-2">
            <Suspense fallback={<SectionSkeleton />}>
              <InfiniteProductGrid />
            </Suspense>
          </div>
        </section>
      </div>
    </PullToRefresh>
  );
};

export default CustomerAppHome;
