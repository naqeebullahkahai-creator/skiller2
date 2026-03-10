import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { Search, ShoppingCart, CreditCard, Truck, CheckCircle } from "lucide-react";

const steps = [
  { icon: Search, title: "Browse & Search", desc: "Use our search bar or browse categories to find what you need. Filter by price, brand, ratings, and more." },
  { icon: ShoppingCart, title: "Add to Cart", desc: "Found something you like? Click 'Add to Cart'. You can add multiple items from different sellers." },
  { icon: CreditCard, title: "Checkout & Pay", desc: "Choose your delivery address, select a payment method (COD, JazzCash, Easypaisa, Bank Transfer), and confirm your order." },
  { icon: Truck, title: "Track Your Order", desc: "Get real-time updates on your order status. Track your package from the seller to your doorstep." },
  { icon: CheckCircle, title: "Receive & Review", desc: "Receive your order, inspect it, and leave a review to help other shoppers make informed decisions." },
];

const HowToBuyPage = () => (
  <>
    <SEOHead title="How to Buy - FANZOON" description="Step-by-step guide on how to shop on FANZOON marketplace." url="/how-to-buy" />
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-display font-bold mb-4">How to Buy on FANZOON</h1>
            <p className="text-primary-foreground/80 text-lg">Shopping made easy in 5 simple steps</p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto max-w-3xl">
            <div className="space-y-0">
              {steps.map((step, i) => (
                <div key={step.title} className="flex gap-6 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md z-10">
                      {i + 1}
                    </div>
                    {i < steps.length - 1 && <div className="w-0.5 h-full bg-border flex-1 my-2" />}
                  </div>
                  <div className="pb-12">
                    <div className="flex items-center gap-3 mb-2">
                      <step.icon className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  </>
);

export default HowToBuyPage;
