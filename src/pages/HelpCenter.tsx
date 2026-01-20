import { useState } from "react";
import { HelpCircle, Truck, RotateCcw, CreditCard, Package, ShieldCheck, ChevronDown, Search, MessageCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqCategories = [
  {
    id: "shipping",
    title: "Shipping & Delivery",
    icon: Truck,
    faqs: [
      {
        q: "What are the delivery charges?",
        a: "Standard delivery is Rs. 150 across Pakistan. Express delivery (1-2 days) is available for Rs. 300. Free shipping on orders above Rs. 5,000!",
      },
      {
        q: "How long does delivery take?",
        a: "Standard delivery takes 3-5 business days. Express delivery is 1-2 business days. Delivery times may vary for remote areas.",
      },
      {
        q: "Do you deliver to all cities in Pakistan?",
        a: "Yes! We deliver to all major cities and most towns across Pakistan including Karachi, Lahore, Islamabad, Peshawar, Quetta, Faisalabad, Multan, and more.",
      },
      {
        q: "Can I track my order?",
        a: "Absolutely! Once your order is shipped, you'll receive a tracking number via SMS and email. You can also track your order from your account page.",
      },
      {
        q: "What if I'm not home during delivery?",
        a: "Our delivery partner will attempt delivery twice. If unsuccessful, the package will be held at the nearest hub for 3 days. You can reschedule delivery through the tracking link.",
      },
    ],
  },
  {
    id: "returns",
    title: "Returns & Refunds",
    icon: RotateCcw,
    faqs: [
      {
        q: "What is your return policy?",
        a: "We offer a 7-day easy return policy. Products must be unused, in original packaging, and with all tags attached. Electronics have a 3-day replacement warranty for manufacturing defects.",
      },
      {
        q: "How do I return a product?",
        a: "Go to 'My Orders' in your account, select the order, and click 'Return Item'. Our team will arrange a pickup from your address within 2-3 days.",
      },
      {
        q: "When will I get my refund?",
        a: "Refunds are processed within 5-7 business days after we receive and inspect the returned item. Bank transfers may take an additional 2-3 days to reflect.",
      },
      {
        q: "Can I exchange instead of return?",
        a: "Yes! You can request an exchange for a different size or color. If the new item costs more, you'll pay the difference. If less, we'll refund the balance.",
      },
      {
        q: "What items cannot be returned?",
        a: "Innerwear, swimwear, customized products, perishable items, and beauty products cannot be returned due to hygiene reasons.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments",
    icon: CreditCard,
    faqs: [
      {
        q: "What payment methods do you accept?",
        a: "We accept Cash on Delivery (COD), EasyPaisa, JazzCash, and Bank Transfer. Credit/Debit card payments coming soon!",
      },
      {
        q: "Is Cash on Delivery available everywhere?",
        a: "COD is available in most areas. Some remote locations may require prepayment. You'll see available payment options at checkout.",
      },
      {
        q: "How do I pay via EasyPaisa/JazzCash?",
        a: "Select EasyPaisa or JazzCash at checkout. You'll receive payment instructions and our account details. Send payment and share the screenshot via WhatsApp.",
      },
      {
        q: "Is my payment information secure?",
        a: "Absolutely! We use industry-standard encryption to protect your data. We never store your complete payment information.",
      },
      {
        q: "Can I pay in installments?",
        a: "Installment plans are not currently available. However, we frequently run sales and discounts to make products more affordable!",
      },
    ],
  },
  {
    id: "orders",
    title: "Orders & Products",
    icon: Package,
    faqs: [
      {
        q: "How do I check order status?",
        a: "Log in to your account and go to 'My Orders'. You'll see real-time status updates for all your orders.",
      },
      {
        q: "Can I cancel my order?",
        a: "Orders can be cancelled before they are shipped. Go to 'My Orders' and click 'Cancel Order'. If already shipped, you can refuse delivery.",
      },
      {
        q: "Are all products authentic?",
        a: "100%! FANZON only sells genuine, authentic products. All items come with original packaging and manufacturer warranty where applicable.",
      },
      {
        q: "Why is a product out of stock?",
        a: "Popular items sell fast! You can click 'Notify Me' on the product page to get an alert when it's back in stock.",
      },
      {
        q: "How do I contact a seller?",
        a: "Click 'Chat Now' on the product page or in your order details. Our seller support team typically responds within a few hours.",
      },
    ],
  },
  {
    id: "account",
    title: "Account & Security",
    icon: ShieldCheck,
    faqs: [
      {
        q: "How do I create an account?",
        a: "Click 'Login/Sign Up' in the header, then select 'Sign Up'. Enter your email and create a password. You can also sign up during checkout.",
      },
      {
        q: "I forgot my password. What do I do?",
        a: "Click 'Forgot Password' on the login page. Enter your email and we'll send you a password reset link.",
      },
      {
        q: "How do I update my address?",
        a: "Go to 'My Account' > 'Addresses' to add, edit, or delete delivery addresses. You can also update during checkout.",
      },
      {
        q: "How do I delete my account?",
        a: "Contact our support team through the chat widget or email support@fanzon.pk. Account deletion requests are processed within 48 hours.",
      },
      {
        q: "Is my personal information safe?",
        a: "We take privacy seriously. Your data is encrypted and never shared with third parties without your consent. See our Privacy Policy for details.",
      },
    ],
  },
];

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredFaqs = searchQuery
    ? faqCategories.flatMap((cat) =>
        cat.faqs
          .filter(
            (faq) =>
              faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
              faq.a.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((faq) => ({ ...faq, category: cat.title }))
      )
    : [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-primary text-primary-foreground py-12 px-4">
          <div className="container mx-auto text-center">
            <HelpCircle size={48} className="mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">How can we help you?</h1>
            <p className="text-primary-foreground/80 mb-6">
              Find answers to frequently asked questions
            </p>
            <div className="max-w-lg mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background text-foreground"
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Search Results */}
          {searchQuery && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">
                Search Results ({filteredFaqs.length})
              </h2>
              {filteredFaqs.length === 0 ? (
                <p className="text-muted-foreground">
                  No results found. Try a different search term.
                </p>
              ) : (
                <Accordion type="single" collapsible className="space-y-2">
                  {filteredFaqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`search-${index}`}
                      className="border rounded-lg px-4"
                    >
                      <AccordionTrigger className="text-left">
                        <div>
                          <span className="text-xs text-primary mb-1 block">
                            {faq.category}
                          </span>
                          {faq.q}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          )}

          {/* FAQ Categories */}
          {!searchQuery && (
            <>
              {/* Category Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {faqCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() =>
                      setActiveCategory(activeCategory === cat.id ? null : cat.id)
                    }
                    className={`p-4 rounded-lg border text-center transition-colors ${
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:border-primary"
                    }`}
                  >
                    <cat.icon size={32} className="mx-auto mb-2" />
                    <span className="text-sm font-medium">{cat.title}</span>
                  </button>
                ))}
              </div>

              {/* FAQ Accordions */}
              {faqCategories
                .filter((cat) => !activeCategory || cat.id === activeCategory)
                .map((cat) => (
                  <div key={cat.id} className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <cat.icon size={24} className="text-primary" />
                      <h2 className="text-xl font-semibold">{cat.title}</h2>
                    </div>
                    <Accordion type="single" collapsible className="space-y-2">
                      {cat.faqs.map((faq, index) => (
                        <AccordionItem
                          key={index}
                          value={`${cat.id}-${index}`}
                          className="border rounded-lg px-4"
                        >
                          <AccordionTrigger className="text-left">
                            {faq.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
            </>
          )}

          {/* Still Need Help */}
          <div className="bg-muted/50 rounded-lg p-6 text-center mt-8">
            <MessageCircle size={32} className="mx-auto text-primary mb-3" />
            <h3 className="text-lg font-semibold mb-2">Still need help?</h3>
            <p className="text-muted-foreground mb-4">
              Our support team is available 24/7 to assist you
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button>
                <MessageCircle size={18} className="mr-2" />
                Chat with Us
              </Button>
              <Button variant="outline">
                Email: support@fanzon.pk
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default HelpCenter;
