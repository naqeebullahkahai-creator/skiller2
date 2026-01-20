import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import HeroCarousel from "@/components/home/HeroCarousel";
import FlashSale from "@/components/home/FlashSale";
import Categories from "@/components/home/Categories";
import JustForYou from "@/components/home/JustForYou";
import SEOHead from "@/components/seo/SEOHead";

const Index = () => {
  return (
    <div className="min-h-screen bg-secondary">
      <SEOHead
        title="Pakistan's Premium Multi-Vendor Store"
        description="Shop authentic products at FANZON Pakistan. Best prices in PKR, Cash on Delivery, Easy Returns. Electronics, Fashion, Home & more!"
        url="/"
      />
      <Header />
      
      <main>
        <HeroCarousel />
        <FlashSale />
        <Categories />
        <JustForYou />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
