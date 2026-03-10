import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { DollarSign, Share2, TrendingUp, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AffiliatePage = () => (
  <>
    <SEOHead title="Affiliate Program - FANZOON" description="Earn money by promoting FANZOON products through our affiliate program." url="/affiliate" />
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary to-accent/80 text-primary-foreground py-20">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">FANZOON Affiliate Program</h1>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8">Earn commissions by sharing products you love. It's free to join and easy to start.</p>
            <Button asChild size="lg" className="bg-card text-primary hover:bg-card/90 rounded-xl font-bold px-8">
              <Link to="/auth/signup">Join Now — It's Free</Link>
            </Button>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto">
            <h2 className="text-3xl font-display font-bold text-foreground text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: Share2, title: "Share Links", desc: "Get unique tracking links for any product on FANZOON" },
                { icon: Gift, title: "Friends Shop", desc: "When someone buys through your link, you earn a commission" },
                { icon: DollarSign, title: "Earn Money", desc: "Earn up to 10% commission on every successful sale" },
                { icon: TrendingUp, title: "Grow Income", desc: "Track your performance and optimize your earnings" },
              ].map((step) => (
                <div key={step.title} className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-card">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">Commission Structure</h2>
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              {[
                { category: "Electronics", rate: "3-5%" },
                { category: "Fashion", rate: "7-10%" },
                { category: "Home & Living", rate: "5-8%" },
              ].map((tier) => (
                <div key={tier.category} className="bg-background rounded-2xl p-6 border border-border">
                  <p className="text-2xl font-bold text-primary">{tier.rate}</p>
                  <p className="text-muted-foreground mt-1">{tier.category}</p>
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

export default AffiliatePage;
