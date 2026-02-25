import { lazy, Suspense } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import MobileHeroBanner from "./MobileHeroBanner";
import MobileCategoryScroll from "./MobileCategoryScroll";
import { FanzonSpinner } from "@/components/ui/fanzon-spinner";

const MobileFlashSale = lazy(() => import("./MobileFlashSale"));
const InfiniteProductGrid = lazy(() => import("@/components/home/InfiniteProductGrid"));

const SectionSkeleton = () => (
  <div className="flex items-center justify-center py-8">
    <FanzonSpinner size="lg" />
  </div>
);

const MobileHomeLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileHeader />
      
      <main className="flex-1 pb-20">
        {/* Hero Banner */}
        <MobileHeroBanner />

        {/* Categories */}
        <MobileCategoryScroll />

        {/* Flash Sale */}
        <Suspense fallback={<SectionSkeleton />}>
          <MobileFlashSale />
        </Suspense>

        {/* Just For You */}
        <section className="pt-2">
          <div className="mx-2.5">
            <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-2.5 px-4 rounded-t-2xl">
              <h2 className="text-sm font-display font-bold text-center">Just For You</h2>
            </div>
            <div className="bg-card rounded-b-2xl p-2.5 border border-t-0 border-border">
              <Suspense fallback={<SectionSkeleton />}>
                <InfiniteProductGrid />
              </Suspense>
            </div>
          </div>
        </section>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default MobileHomeLayout;
