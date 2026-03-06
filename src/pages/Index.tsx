import { lazy, Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroCarousel from "@/components/home/HeroCarousel";
import Categories from "@/components/home/Categories";
import SEOHead from "@/components/seo/SEOHead";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import SectionErrorBoundary from "@/components/SectionErrorBoundary";
import { FanzonSpinner } from "@/components/ui/fanzon-spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileHomeLayout from "@/components/mobile/MobileHomeLayout";

const FlashSaleSection = lazy(() => import("@/components/home/FlashSaleSection"));
const InfiniteProductGrid = lazy(() => import("@/components/home/InfiniteProductGrid"));
const RecentlyViewedSection = lazy(() => import("@/components/home/RecentlyViewedSection"));

const SectionSkeleton = () => (
  <div className="flex items-center justify-center py-12">
    <FanzonSpinner size="lg" />
  </div>
);

const GridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="bg-card rounded-xl overflow-hidden elevation-1">
        <Skeleton className="aspect-square w-full" />
        <div className="p-3 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <>
      <SEOHead
        title="FANZOON - Pakistan's Best Online Marketplace"
        description="Shop millions of products with fast delivery, secure payments, and great prices. Electronics, Fashion, Home & more."
        url="/"
      />
      <OrganizationJsonLd />

      {isMobile ? (
        <MobileHomeLayout />
      ) : (
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <main className="flex-1">
            <SectionErrorBoundary fallbackMessage="Banner couldn't load">
              <HeroCarousel />
            </SectionErrorBoundary>

            <SectionErrorBoundary fallbackMessage="Categories couldn't load">
              <Categories />
            </SectionErrorBoundary>

            <SectionErrorBoundary fallbackMessage="Flash sale couldn't load">
              <Suspense fallback={<SectionSkeleton />}>
                <FlashSaleSection />
              </Suspense>
            </SectionErrorBoundary>

            <SectionErrorBoundary>
              <Suspense fallback={null}>
                <RecentlyViewedSection />
              </Suspense>
            </SectionErrorBoundary>

            {/* Just For You */}
            <section className="py-8">
              <div className="container mx-auto">
                <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-3.5 px-5 rounded-t-2xl">
                  <h2 className="text-base md:text-lg font-bold text-center tracking-wide">Just For You</h2>
                </div>
                <div className="bg-card rounded-b-2xl p-4 border border-t-0 border-border/50">
                  <SectionErrorBoundary fallbackMessage="Products couldn't load">
                    <Suspense fallback={<GridSkeleton />}>
                      <InfiniteProductGrid />
                    </Suspense>
                  </SectionErrorBoundary>
                </div>
              </div>
            </section>
          </main>
          <Footer />
        </div>
      )}
    </>
  );
};

export default Index;
