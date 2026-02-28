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
    <>
      <MobileHeroBanner />
      <MobileCategoryScroll />
      <Suspense fallback={<SectionSkeleton />}>
        <MobileFlashSale />
      </Suspense>
      <section className="pt-3">
        <div className="mx-2.5">
          <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-3 px-4 rounded-t-2xl">
            <h2 className="text-sm font-display font-bold text-center tracking-wide">Just For You</h2>
          </div>
          <div className="bg-card rounded-b-2xl p-2.5 border border-t-0 border-border/40">
            <Suspense fallback={<SectionSkeleton />}>
              <InfiniteProductGrid />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
};

export default CustomerAppHome;
