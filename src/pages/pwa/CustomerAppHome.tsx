import { lazy, Suspense } from "react";
import MobileHeroBanner from "@/components/mobile/MobileHeroBanner";
import MobileCategoryScroll from "@/components/mobile/MobileCategoryScroll";
import { FanzonSpinner } from "@/components/ui/fanzon-spinner";

const MobileFlashSale = lazy(() => import("@/components/mobile/MobileFlashSale"));
const InfiniteProductGrid = lazy(() => import("@/components/home/InfiniteProductGrid"));

const SectionSkeleton = () => (
  <div className="flex items-center justify-center py-8">
    <FanzonSpinner size="lg" />
  </div>
);

const CustomerAppHome = () => {
  return (
    <div className="space-y-2">
      <MobileHeroBanner />
      <MobileCategoryScroll />

      <Suspense fallback={<SectionSkeleton />}>
        <MobileFlashSale />
      </Suspense>

      {/* Just For You */}
      <section className="bg-card">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
          <h2 className="font-bold text-sm text-foreground">Just For You</h2>
        </div>
        <div className="p-1.5">
          <Suspense fallback={<SectionSkeleton />}>
            <InfiniteProductGrid />
          </Suspense>
        </div>
      </section>
    </div>
  );
};

export default CustomerAppHome;
