import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";

const sections = [
  { title: "Information We Collect", content: "We collect personal information you provide during registration (name, email, phone number, address), transaction data, browsing behavior, and device information. We also collect information from sellers including business details and banking information for payment processing." },
  { title: "How We Use Your Information", content: "Your information is used to process orders, provide customer support, personalize your shopping experience, send relevant notifications, prevent fraud, and improve our platform. We may also use aggregated data for analytics purposes." },
  { title: "Information Sharing", content: "We share necessary information with sellers to fulfill orders, with payment processors to handle transactions, and with courier services for delivery. We do not sell your personal data to third parties for marketing purposes." },
  { title: "Data Security", content: "We implement industry-standard encryption and security measures to protect your data. All payment information is processed through secure, PCI-compliant systems. However, no system is 100% secure, and we cannot guarantee absolute data security." },
  { title: "Cookies & Tracking", content: "We use cookies and similar technologies to enhance your browsing experience, remember your preferences, and analyze platform usage. You can manage cookie preferences through your browser settings." },
  { title: "Your Rights", content: "You have the right to access, update, or delete your personal information. You can manage notification preferences in your account settings. To request data deletion, please contact our support team." },
  { title: "Data Retention", content: "We retain your data for as long as your account is active or as needed to provide services. Transaction records are retained for legal and accounting purposes as required by Pakistani law." },
  { title: "Contact Us", content: "If you have questions about this privacy policy, please contact us at privacy@fanzoon.pk or through our Help Center." },
];

const PrivacyPage = () => (
  <>
    <SEOHead title="Privacy Policy - FANZOON" description="FANZOON's privacy policy explains how we collect and protect your data." url="/privacy" />
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">Privacy Policy</h1>
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

export default PrivacyPage;
