import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "ur";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
  dir: "ltr" | "rtl";
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.categories": "Categories",
    "nav.cart": "Cart",
    "nav.account": "Account",
    "nav.messages": "Messages",
    "nav.wishlist": "Wishlist",
    "nav.orders": "Orders",
    "nav.help": "Help Center",
    "nav.settings": "Settings",
    "nav.language": "Language",
    "nav.all_categories": "All Categories",
    
    // Auth
    "auth.login": "Login",
    "auth.signup": "Sign Up",
    "auth.logout": "Logout",
    "auth.login_signup": "Login / Sign Up",
    "auth.my_account": "My Account",
    "auth.my_orders": "My Orders",
    "auth.admin_dashboard": "Admin Dashboard",
    "auth.seller_center": "Seller Center",
    
    // Search
    "search.placeholder": "Search in FANZON",
    "search.search": "Search",
    
    // Product
    "product.add_to_cart": "Add to Cart",
    "product.buy_now": "Buy Now",
    "product.out_of_stock": "Out of Stock",
    "product.in_stock": "In Stock",
    "product.quantity": "Quantity",
    "product.description": "Description",
    "product.reviews": "Reviews",
    "product.share": "Share",
    "product.copy_link": "Copy Link",
    "product.share_whatsapp": "Share on WhatsApp",
    "product.share_facebook": "Share on Facebook",
    "product.link_copied": "Link copied to clipboard!",
    "product.price": "Price",
    "product.discount": "Discount",
    "product.free_delivery": "Free Delivery",
    
    // Cart
    "cart.title": "Shopping Cart",
    "cart.empty": "Your cart is empty",
    "cart.subtotal": "Subtotal",
    "cart.checkout": "Checkout",
    "cart.continue_shopping": "Continue Shopping",
    "cart.remove": "Remove",
    "cart.added": "Product Added to Cart",
    "cart.added_desc": "has been added to your cart",
    
    // Checkout
    "checkout.title": "Checkout",
    "checkout.shipping": "Shipping Address",
    "checkout.payment": "Payment Method",
    "checkout.place_order": "Place Order",
    "checkout.order_summary": "Order Summary",
    
    // Orders
    "orders.title": "My Orders",
    "orders.status": "Order Status",
    "orders.track": "Track Order",
    "orders.details": "Order Details",
    "orders.pending": "Pending",
    "orders.processing": "Processing",
    "orders.shipped": "Shipped",
    "orders.delivered": "Delivered",
    "orders.cancelled": "Cancelled",
    
    // Footer
    "footer.customer_care": "Customer Care",
    "footer.about": "About FANZON",
    "footer.earn": "Earn With FANZON",
    "footer.payment": "Payment Methods",
    "footer.stay_connected": "Stay Connected",
    "footer.subscribe": "Subscribe",
    "footer.subscribe_desc": "Subscribe for exclusive deals",
    "footer.free_delivery": "Free Delivery",
    "footer.free_delivery_desc": "On orders over Rs.999",
    "footer.secure_payment": "Secure Payment",
    "footer.secure_payment_desc": "100% Protected",
    "footer.easy_returns": "Easy Returns",
    "footer.easy_returns_desc": "7-day returns",
    "footer.support_24_7": "24/7 Support",
    "footer.support_desc": "Dedicated support",
    
    // Common
    "common.hello": "Hello",
    "common.welcome": "Welcome",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.no_results": "No results found",
    
    // Notifications
    "notification.product_added": "Product Added to Cart",
    "notification.order_placed": "Order Placed Successfully",
    "notification.error_occurred": "An error occurred",
  },
  ur: {
    // Navigation
    "nav.home": "ہوم",
    "nav.categories": "زمرہ جات",
    "nav.cart": "ٹوکری",
    "nav.account": "اکاؤنٹ",
    "nav.messages": "پیغامات",
    "nav.wishlist": "پسندیدہ",
    "nav.orders": "آرڈرز",
    "nav.help": "مدد مرکز",
    "nav.settings": "ترتیبات",
    "nav.language": "زبان",
    "nav.all_categories": "تمام زمرہ جات",
    
    // Auth
    "auth.login": "لاگ ان",
    "auth.signup": "سائن اپ",
    "auth.logout": "لاگ آؤٹ",
    "auth.login_signup": "لاگ ان / سائن اپ",
    "auth.my_account": "میرا اکاؤنٹ",
    "auth.my_orders": "میرے آرڈرز",
    "auth.admin_dashboard": "ایڈمن ڈیش بورڈ",
    "auth.seller_center": "سیلر سینٹر",
    
    // Search
    "search.placeholder": "FANZON میں تلاش کریں",
    "search.search": "تلاش کریں",
    
    // Product
    "product.add_to_cart": "ٹوکری میں ڈالیں",
    "product.buy_now": "ابھی خریدیں",
    "product.out_of_stock": "اسٹاک میں نہیں",
    "product.in_stock": "اسٹاک میں دستیاب",
    "product.quantity": "مقدار",
    "product.description": "تفصیل",
    "product.reviews": "جائزے",
    "product.share": "شیئر کریں",
    "product.copy_link": "لنک کاپی کریں",
    "product.share_whatsapp": "واٹس ایپ پر شیئر کریں",
    "product.share_facebook": "فیس بک پر شیئر کریں",
    "product.link_copied": "لنک کلپ بورڈ پر کاپی ہو گیا!",
    "product.price": "قیمت",
    "product.discount": "رعایت",
    "product.free_delivery": "مفت ڈیلیوری",
    
    // Cart
    "cart.title": "شاپنگ ٹوکری",
    "cart.empty": "آپ کی ٹوکری خالی ہے",
    "cart.subtotal": "ذیلی کل",
    "cart.checkout": "چیک آؤٹ",
    "cart.continue_shopping": "خریداری جاری رکھیں",
    "cart.remove": "ہٹائیں",
    "cart.added": "پروڈکٹ ٹوکری میں شامل ہو گئی",
    "cart.added_desc": "آپ کی ٹوکری میں شامل ہو گیا",
    
    // Checkout
    "checkout.title": "چیک آؤٹ",
    "checkout.shipping": "ترسیل کا پتہ",
    "checkout.payment": "ادائیگی کا طریقہ",
    "checkout.place_order": "آرڈر دیں",
    "checkout.order_summary": "آرڈر کا خلاصہ",
    
    // Orders
    "orders.title": "میرے آرڈرز",
    "orders.status": "آرڈر کی صورتحال",
    "orders.track": "آرڈر ٹریک کریں",
    "orders.details": "آرڈر کی تفصیلات",
    "orders.pending": "زیر التواء",
    "orders.processing": "پروسیسنگ",
    "orders.shipped": "بھیج دیا گیا",
    "orders.delivered": "ڈیلیور ہو گیا",
    "orders.cancelled": "منسوخ",
    
    // Footer
    "footer.customer_care": "کسٹمر کیئر",
    "footer.about": "FANZON کے بارے میں",
    "footer.earn": "FANZON سے کمائیں",
    "footer.payment": "ادائیگی کے طریقے",
    "footer.stay_connected": "جڑے رہیں",
    "footer.subscribe": "سبسکرائب کریں",
    "footer.subscribe_desc": "خصوصی پیشکشوں کے لیے سبسکرائب کریں",
    "footer.free_delivery": "مفت ڈیلیوری",
    "footer.free_delivery_desc": "999 روپے سے زیادہ آرڈرز پر",
    "footer.secure_payment": "محفوظ ادائیگی",
    "footer.secure_payment_desc": "100% محفوظ",
    "footer.easy_returns": "آسان واپسی",
    "footer.easy_returns_desc": "7 دن کی واپسی",
    "footer.support_24_7": "24/7 سپورٹ",
    "footer.support_desc": "مخصوص سپورٹ",
    
    // Common
    "common.hello": "السلام علیکم",
    "common.welcome": "خوش آمدید",
    "common.save": "محفوظ کریں",
    "common.cancel": "منسوخ کریں",
    "common.confirm": "تصدیق کریں",
    "common.delete": "حذف کریں",
    "common.edit": "ترمیم کریں",
    "common.view": "دیکھیں",
    "common.loading": "لوڈ ہو رہا ہے...",
    "common.error": "خرابی",
    "common.success": "کامیاب",
    "common.no_results": "کوئی نتائج نہیں ملے",
    
    // Notifications
    "notification.product_added": "پروڈکٹ ٹوکری میں شامل ہو گئی",
    "notification.order_placed": "آرڈر کامیابی سے دے دیا گیا",
    "notification.error_occurred": "ایک خرابی ہوئی",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("fanzon-language");
    return (saved as Language) || "en";
  });

  const isRTL = language === "ur";
  const dir = isRTL ? "rtl" : "ltr";

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("fanzon-language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Apply RTL and font changes to document
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    
    if (isRTL) {
      document.documentElement.classList.add("rtl");
      document.body.style.fontFamily = "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif";
    } else {
      document.documentElement.classList.remove("rtl");
      document.body.style.fontFamily = "";
    }
  }, [language, dir, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};
