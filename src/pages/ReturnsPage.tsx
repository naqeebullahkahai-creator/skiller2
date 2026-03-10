import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { RotateCcw, Clock, Package, CheckCircle, AlertCircle } from "lucide-react";

const ReturnsPage = () => (
  <>
    <SEOHead title="Returns & Refunds - FANZOON" description="FANZOON's returns and refunds policy." url="/returns" />
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">Returns & Refunds</h1>
          
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {[
              { icon: Clock, label: "7-Day Returns", desc: "Return within 7 days of delivery" },
              { icon: RotateCcw, label: "Easy Process", desc: "Simple return request from your account" },
              { icon: Package, label: "Free Pickup", desc: "We'll pick up the item from your address" },
            ].map((item) => (
              <div key={item.label} className="bg-card rounded-2xl p-5 border border-border text-center">
                <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-bold text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary" /> Eligible for Return</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Item received is damaged, defective, or wrong</li>
                <li>Item doesn't match the product description</li>
                <li>Item is within the 7-day return window</li>
                <li>Item is in its original packaging with tags intact</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-destructive" /> Not Eligible for Return</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Perishable goods (food, flowers, etc.)</li>
                <li>Personal hygiene products</li>
                <li>Digital products or software</li>
                <li>Items damaged by the buyer after delivery</li>
                <li>Customized or personalized items</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">Refund Process</h2>
              <p className="text-muted-foreground leading-relaxed">Once we receive and inspect the returned item, your refund will be processed within 5-10 business days. Refunds are credited to your FANZOON wallet or original payment method, depending on how you paid.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  </>
);

export default ReturnsPage;
