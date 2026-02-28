import { lazy, Suspense, useCallback } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import MobileHeroBanner from "./MobileHeroBanner";
import MobileCategoryScroll from "./MobileCategoryScroll";
import PullToRefresh from "./PullToRefresh";
import TopProgressBar from "@/components/pwa/TopProgressBar";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";

const MobileFlashSale = lazy(() => import("./MobileFlashSale"));
const InfiniteProductGrid = lazy(() => import("@/components/home/InfiniteProductGrid"));

const SectionSkeleton = () => (
  <div className="px-2 py-4">
    <div className="grid grid-cols-2 gap-2">
      {[1,2,3,4].map(i => (
        <div key={i} className="bg-card rounded-xl overflow-hidden elevation-1">
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

const MobileHomeLayout = () => {
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries();
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <TopProgressBar />
      <MobileHeader />

      <PullToRefresh onRefresh={handleRefresh}>
        <main className="flex-1 pb-16 page-enter">
          <MobileHeroBanner />
          <MobileCategoryScroll />

          <Suspense fallback={<SectionSkeleton />}>
            <MobileFlashSale />
          </Suspense>

          {/* Just For You */}
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
        </main>
      </PullToRefresh>

      <MobileBottomNav />
    </div>
  );
};

export default MobileHomeLayout;
