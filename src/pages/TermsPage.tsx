import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";

const sections = [
  { title: "1. Acceptance of Terms", content: "By accessing and using FANZOON's website and mobile application, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services." },
  { title: "2. Account Registration", content: "Users must provide accurate information during registration. You are responsible for maintaining the confidentiality of your account credentials. FANZOON reserves the right to suspend or terminate accounts that violate our policies." },
  { title: "3. Product Listings", content: "Sellers are responsible for the accuracy of product descriptions, pricing, and images. FANZOON acts as a marketplace platform and does not guarantee the quality of third-party products." },
  { title: "4. Orders & Payments", content: "All orders are subject to product availability. Payment must be completed through our approved payment methods. Prices are displayed in Pakistani Rupees (PKR) and include applicable taxes unless stated otherwise." },
  { title: "5. Shipping & Delivery", content: "Delivery timelines are estimates and may vary based on location and courier availability. FANZOON is not liable for delays caused by unforeseen circumstances." },
  { title: "6. Returns & Refunds", content: "Products may be returned within 7 days of delivery if they meet our return policy criteria. Refunds are processed to the original payment method or FANZOON wallet within 5-10 business days." },
  { title: "7. Seller Obligations", content: "Sellers must comply with all applicable Pakistani laws and regulations. Counterfeit or prohibited items are strictly forbidden. Violations may result in permanent account suspension." },
  { title: "8. Intellectual Property", content: "All content on FANZOON, including logos, designs, and text, is the property of FANZOON and protected by intellectual property laws." },
  { title: "9. Privacy", content: "Your use of FANZOON is also governed by our Privacy Policy. Please review it to understand how we collect, use, and protect your personal information." },
  { title: "10. Changes to Terms", content: "FANZOON reserves the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms." },
];

const TermsPage = () => (
  <>
    <SEOHead title="Terms & Conditions - FANZOON" description="Read FANZOON's terms and conditions for using our marketplace." url="/terms" />
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">Terms & Conditions</h1>
          <p className="text-muted-foreground mb-10">Last updated: March 2026</p>
          <div className="space-y-8">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="text-lg font-bold text-foreground mb-2">{s.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  </>
);

export default TermsPage;
