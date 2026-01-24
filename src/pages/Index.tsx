import { lazy, Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import HeroCarousel from "@/components/home/HeroCarousel";
import Categories from "@/components/home/Categories";
import SEOHead from "@/components/seo/SEOHead";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import ProductCardSkeleton from "@/components/ui/product-card-skeleton";

// Lazy load below-fold components for faster initial paint
const FlashSaleSection = lazy(() => import("@/components/home/FlashSaleSection"));
const InfiniteProductGrid = lazy(() => import("@/components/home/InfiniteProductGrid"));

// Fallback for lazy-loaded sections
const SectionSkeleton = () => (
  <div className="bg-secondary py-6">
    <div className="container mx-auto">
      <div className="bg-muted h-12 rounded-t-lg animate-pulse" />
      <div className="bg-card p-4 rounded-b-lg">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-secondary">
      <SEOHead
        title="FANZON - Pakistan's Premium Multi-Vendor Store"
        description="Shop authentic products at FANZON Pakistan. Best prices in PKR, Cash on Delivery, Easy Returns. Electronics, Fashion, Home & more!"
        url="/"
      />
      <OrganizationJsonLd />
      
      <Header />
      
      <main>
        {/* Critical above-the-fold content - loads immediately */}
        <HeroCarousel />
        <Categories />
        
        {/* Lazy-loaded below-fold content */}
        <Suspense fallback={<SectionSkeleton />}>
          <FlashSaleSection />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <InfiniteProductGrid />
        </Suspense>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
