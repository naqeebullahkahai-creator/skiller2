import { lazy, Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroCarousel from "@/components/home/HeroCarousel";
import Categories from "@/components/home/Categories";
import SEOHead from "@/components/seo/SEOHead";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import { FanzonSpinner } from "@/components/ui/fanzon-spinner";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileHomeLayout from "@/components/mobile/MobileHomeLayout";

// Lazy load below-fold sections
const FlashSaleSection = lazy(() => import("@/components/home/FlashSaleSection"));
const InfiniteProductGrid = lazy(() => import("@/components/home/InfiniteProductGrid"));
const RecentlyViewedSection = lazy(() => import("@/components/home/RecentlyViewedSection"));

const SectionSkeleton = () => (
  <div className="flex items-center justify-center py-12">
    <FanzonSpinner size="lg" />
  </div>
);

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <>
      <SEOHead
        title="FANZON - Pakistan's Best Online Marketplace"
        description="Shop millions of products with fast delivery, secure payments, and great prices. Electronics, Fashion, Home & more."
        url="/"
      />
      <OrganizationJsonLd />

      {isMobile ? (
        <MobileHomeLayout />
      ) : (
        <div className="min-h-screen bg-secondary flex flex-col">
          <Header />
          <main className="flex-1 pb-16 md:pb-0">
            <HeroCarousel />
            <Categories />
            <Suspense fallback={<SectionSkeleton />}>
              <FlashSaleSection />
            </Suspense>
            <Suspense fallback={null}>
              <RecentlyViewedSection />
            </Suspense>
            <section className="bg-secondary py-4">
              <div className="container mx-auto">
                <div className="bg-primary text-white py-2.5 px-4 rounded-t">
                  <h2 className="text-base md:text-lg font-bold text-center">Just For You</h2>
                </div>
                <div className="bg-card rounded-b p-3">
                  <Suspense fallback={<SectionSkeleton />}>
                    <InfiniteProductGrid />
                  </Suspense>
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
