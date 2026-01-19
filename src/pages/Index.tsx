import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import HeroCarousel from "@/components/home/HeroCarousel";
import FlashSale from "@/components/home/FlashSale";
import Categories from "@/components/home/Categories";
import JustForYou from "@/components/home/JustForYou";

const Index = () => {
  return (
    <div className="min-h-screen bg-secondary">
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
