import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { Building2, Users, Globe, ShieldCheck, Heart, Truck } from "lucide-react";

const AboutPage = () => {
  return (
    <>
      <SEOHead title="About Us - FANZOON" description="Learn about FANZOON, Pakistan's leading online marketplace." url="/about" />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero */}
          <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-20">
            <div className="container mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">About FANZOON</h1>
              <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">Pakistan's fastest growing online marketplace connecting millions of buyers with trusted sellers across the country.</p>
            </div>
          </section>

          {/* Mission */}
          <section className="py-16">
            <div className="container mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-display font-bold text-foreground mb-4">Our Mission</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    At FANZOON, we believe shopping should be simple, affordable, and accessible for everyone. Our platform brings together the best local and international sellers to offer a wide range of products — from electronics and fashion to home essentials and more.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    We're committed to empowering small businesses and entrepreneurs by giving them the tools and reach they need to grow their brands online.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Users, label: "1M+ Customers", desc: "Trusted by millions" },
                    { icon: Building2, label: "10K+ Sellers", desc: "Verified partners" },
                    { icon: Globe, label: "All Pakistan", desc: "Nationwide delivery" },
                    { icon: ShieldCheck, label: "100% Secure", desc: "Safe transactions" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-card rounded-2xl p-6 text-center border border-border shadow-sm">
                      <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                      <p className="font-bold text-foreground">{stat.label}</p>
                      <p className="text-sm text-muted-foreground">{stat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Values */}
          <section className="py-16 bg-card">
            <div className="container mx-auto">
              <h2 className="text-3xl font-display font-bold text-foreground text-center mb-12">Our Values</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: Heart, title: "Customer First", desc: "Every decision we make starts with how it impacts our customers. Your satisfaction is our priority." },
                  { icon: ShieldCheck, title: "Trust & Safety", desc: "We maintain the highest standards of security and authenticity to protect our buyers and sellers." },
                  { icon: Truck, title: "Fast & Reliable", desc: "Our logistics network ensures your orders are delivered quickly and safely to your doorstep." },
                ].map((value) => (
                  <div key={value.title} className="text-center p-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.desc}</p>
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
};

export default AboutPage;
