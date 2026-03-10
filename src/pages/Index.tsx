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
import { TrendingUp, Zap, Gift, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const FlashSaleSection = lazy(() => import("@/components/home/FlashSaleSection"));
const InfiniteProductGrid = lazy(() => import("@/components/home/InfiniteProductGrid"));
const RecentlyViewedSection = lazy(() => import("@/components/home/RecentlyViewedSection"));

const SectionSkeleton = () => (
  <div className="flex items-center justify-center py-12">
    <FanzonSpinner size="lg" />
  </div>
);

const GridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="bg-card rounded-xl overflow-hidden border border-border/40">
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
            {/* Hero */}
            <SectionErrorBoundary fallbackMessage="Banner couldn't load">
              <HeroCarousel />
            </SectionErrorBoundary>

            {/* Quick Access Bar */}
            <div className="bg-card border-b border-border/40">
              <div className="container mx-auto py-3">
                <div className="flex items-center gap-3">
                  <Link to="/flash-sale" className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl hover:from-accent/15 hover:to-accent/10 transition-all group">
                    <Zap size={18} className="text-accent" />
                    <span className="text-sm font-semibold text-foreground">Flash Sale</span>
                    <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link to="/vouchers" className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary/8 to-primary/4 rounded-xl hover:from-primary/12 hover:to-primary/8 transition-all group">
                    <Gift size={18} className="text-primary" />
                    <span className="text-sm font-semibold text-foreground">Vouchers</span>
                    <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link to="/daily-coupons" className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-fanzon-violet/10 to-fanzon-violet/5 rounded-xl hover:from-fanzon-violet/15 hover:to-fanzon-violet/10 transition-all group">
                    <TrendingUp size={18} className="text-fanzon-violet" />
                    <span className="text-sm font-semibold text-foreground">Daily Deals</span>
                    <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Categories */}
            <SectionErrorBoundary fallbackMessage="Categories couldn't load">
              <Categories />
            </SectionErrorBoundary>

            {/* Flash Sale */}
            <SectionErrorBoundary fallbackMessage="Flash sale couldn't load">
              <Suspense fallback={<SectionSkeleton />}>
                <FlashSaleSection />
              </Suspense>
            </SectionErrorBoundary>

            {/* Recently Viewed */}
            <SectionErrorBoundary>
              <Suspense fallback={null}>
                <RecentlyViewedSection />
              </Suspense>
            </SectionErrorBoundary>

            {/* Just For You */}
            <section className="py-6">
              <div className="container mx-auto">
                <div className="flex items-center justify-between mb-5">
                  <div className="section-divider pt-1">
                    <h2 className="text-lg font-display font-bold text-foreground tracking-tight">Just For You</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Handpicked recommendations</p>
                  </div>
                </div>
                <SectionErrorBoundary fallbackMessage="Products couldn't load">
                  <Suspense fallback={<GridSkeleton />}>
                    <InfiniteProductGrid />
                  </Suspense>
                </SectionErrorBoundary>
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
