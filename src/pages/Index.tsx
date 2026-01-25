import { lazy, Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import HeroCarousel from "@/components/home/HeroCarousel";
import Categories from "@/components/home/Categories";
import SEOHead from "@/components/seo/SEOHead";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import { FanzonSpinner } from "@/components/ui/fanzon-spinner";
import { Sparkles, Truck, ShieldCheck, HeadphonesIcon } from "lucide-react";

// Lazy load below-fold components for faster initial paint
const FlashSaleSection = lazy(() => import("@/components/home/FlashSaleSection"));
const InfiniteProductGrid = lazy(() => import("@/components/home/InfiniteProductGrid"));

// Premium loading state
const SectionSkeleton = () => (
  <div className="py-12">
    <div className="container mx-auto flex items-center justify-center">
      <FanzonSpinner size="lg" />
    </div>
  </div>
);

// Features bar data
const features = [
  { icon: Truck, label: "Free Shipping", desc: "On orders over Rs. 2000" },
  { icon: ShieldCheck, label: "Secure Payment", desc: "100% protected" },
  { icon: Sparkles, label: "Best Quality", desc: "Authentic products" },
  { icon: HeadphonesIcon, label: "24/7 Support", desc: "Dedicated support" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="FANZON - Pakistan's Premium Multi-Vendor Store"
        description="Shop authentic products at FANZON Pakistan. Best prices in PKR, Cash on Delivery, Easy Returns. Electronics, Fashion, Home & more!"
        url="/"
      />
      <OrganizationJsonLd />
      
      <Header />
      
      <main className="pb-20 md:pb-0">
        {/* Hero Section */}
        <HeroCarousel />
        
        {/* Features Bar */}
        <section className="bg-card border-b border-border">
          <div className="container mx-auto py-4 md:py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {features.map((feature) => (
                <div key={feature.label} className="flex items-center gap-3 justify-center md:justify-start">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold text-foreground">{feature.label}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                  <p className="text-xs font-medium text-foreground md:hidden">{feature.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Categories */}
        <Categories />
        
        {/* Flash Sales */}
        <Suspense fallback={<SectionSkeleton />}>
          <FlashSaleSection />
        </Suspense>
        
        {/* Products Grid */}
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
