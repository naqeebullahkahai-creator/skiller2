import { lazy, Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import HeroCarousel from "@/components/home/HeroCarousel";
import Categories from "@/components/home/Categories";
import SEOHead from "@/components/seo/SEOHead";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import { FanzonSpinner } from "@/components/ui/fanzon-spinner";
import { Truck, Shield, RotateCcw, Headphones } from "lucide-react";

// Lazy load below-fold sections
const FlashSaleSection = lazy(() => import("@/components/home/FlashSaleSection"));
const InfiniteProductGrid = lazy(() => import("@/components/home/InfiniteProductGrid"));

const SectionSkeleton = () => (
  <div className="flex items-center justify-center py-12">
    <FanzonSpinner size="lg" />
  </div>
);

const features = [
  { icon: Truck, label: "Free Shipping", desc: "Orders over Rs. 2000" },
  { icon: Shield, label: "Secure Payment", desc: "100% Protected" },
  { icon: RotateCcw, label: "Easy Returns", desc: "7-Day Policy" },
  { icon: Headphones, label: "24/7 Support", desc: "Dedicated Help" },
];

const Index = () => {
  return (
    <>
      <SEOHead
        title="FANZON - Pakistan's Best Online Marketplace"
        description="Shop millions of products with fast delivery, secure payments, and great prices. Electronics, Fashion, Home & more."
        url="/"
      />
      <OrganizationJsonLd />
      
      <div className="min-h-screen bg-secondary flex flex-col">
        <Header />
        
        <main className="flex-1 pb-16 md:pb-0">
          {/* Hero Section */}
          <HeroCarousel />

          {/* Features Bar */}
          <section className="bg-card border-b border-border">
            <div className="container mx-auto py-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 md:gap-3 justify-center md:justify-start"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-fanzon-orange-light flex items-center justify-center flex-shrink-0">
                      <feature.icon size={16} className="text-primary md:w-5 md:h-5" />
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs md:text-sm font-semibold text-foreground">{feature.label}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">{feature.desc}</p>
                    </div>
                    <span className="sm:hidden text-[10px] font-medium text-foreground">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Categories */}
          <Categories />

          {/* Flash Sale */}
          <Suspense fallback={<SectionSkeleton />}>
            <FlashSaleSection />
          </Suspense>

          {/* Just For You - Infinite Scroll */}
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
        <MobileBottomNav />
      </div>
    </>
  );
};

export default Index;
