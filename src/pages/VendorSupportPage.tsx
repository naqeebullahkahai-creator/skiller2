import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { Headphones, MessageCircle, BookOpen, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const VendorSupportPage = () => (
  <>
    <SEOHead title="Vendor Support - FANZOON" description="Get help and support for selling on FANZOON marketplace." url="/vendor-support" />
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-display font-bold mb-4">Vendor Support Center</h1>
            <p className="text-primary-foreground/80 text-lg">Everything you need to succeed as a FANZOON seller</p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: MessageCircle, title: "Live Chat Support", desc: "Chat with our dedicated seller support team for instant help with your queries.", action: "Start Chat" },
                { icon: BookOpen, title: "Seller Knowledge Base", desc: "Browse guides, tutorials, and FAQs to learn how to maximize your sales.", action: "Browse Guides" },
                { icon: Headphones, title: "Priority Support", desc: "Premium sellers get priority phone and email support with faster response times.", action: "Learn More" },
              ].map((card) => (
                <div key={card.title} className="bg-card rounded-2xl p-8 border border-border hover:shadow-md transition-shadow text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <card.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{card.title}</h3>
                  <p className="text-muted-foreground mb-6">{card.desc}</p>
                  <Button variant="outline" className="rounded-xl">{card.action}</Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-card">
          <div className="container mx-auto max-w-2xl">
            <h2 className="text-2xl font-display font-bold text-foreground text-center mb-8">Contact Us Directly</h2>
            <div className="space-y-4">
              {[
                { icon: Phone, label: "Phone", value: "+92 42 1234 5678", desc: "Mon-Sat, 9am-6pm" },
                { icon: Mail, label: "Email", value: "sellers@fanzoon.pk", desc: "Response within 24 hours" },
                { icon: Clock, label: "Working Hours", value: "Monday - Saturday", desc: "9:00 AM - 6:00 PM PKT" },
              ].map((contact) => (
                <div key={contact.label} className="flex items-center gap-4 bg-background rounded-xl p-4 border border-border">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <contact.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{contact.value}</p>
                    <p className="text-sm text-muted-foreground">{contact.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild className="rounded-xl px-8">
                <Link to="/business/signup">Become a Seller</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  </>
);

export default VendorSupportPage;
