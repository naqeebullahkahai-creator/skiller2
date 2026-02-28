import { lazy, Suspense } from "react";
import MobileHeroBanner from "@/components/mobile/MobileHeroBanner";
import MobileCategoryScroll from "@/components/mobile/MobileCategoryScroll";
import { Skeleton } from "@/components/ui/skeleton";

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
  return (
    <div className="page-enter">
      {/* Banner Slider */}
      <MobileHeroBanner />

      {/* Category Scroll */}
      <MobileCategoryScroll />

      {/* Flash Deals */}
      <Suspense fallback={<SectionSkeleton />}>
        <MobileFlashSale />
      </Suspense>

      {/* Just For You — 2-column grid */}
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
  );
};

export default CustomerAppHome;
