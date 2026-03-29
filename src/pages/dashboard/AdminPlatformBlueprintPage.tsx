import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, BookOpen } from "lucide-react";
import { toast } from "sonner";

const blueprintText = `
═══════════════════════════════════════════════════════════════
                    FANZON MARKETPLACE — COMPLETE PLATFORM BLUEPRINT
═══════════════════════════════════════════════════════════════

🏗️ PLATFORM OVERVIEW
━━━━━━━━━━━━━━━━━━━━
FANZON is a full-featured multi-vendor e-commerce marketplace built for Pakistan.
Stack: React 18 + Vite + TypeScript + Tailwind CSS + Supabase (Lovable Cloud)
State: TanStack React Query for server state, React Context for UI state
Routing: React Router v6 with domain-based routing (admin/seller/customer subdomains)
UI Library: shadcn/ui (Radix primitives) + custom components
PWA: vite-plugin-pwa with mobile-first app shells per role

═══════════════════════════════════════════════════════════════
🎨 DESIGN SYSTEM & THEME
━━━━━━━━━━━━━━━━━━━━━━━
Aesthetic: "Premium Editorial Marketplace"
Mode: Light mode ONLY (no dark mode)

COLORS (HSL):
  --background: 40 20% 97% (Warm Ivory #F9F8F5)
  --foreground: 220 30% 10%
  --primary: 173 78% 26% (Deep Teal #0F766E)
  --primary-foreground: 0 0% 100%
  --secondary: 40 15% 94%
  --accent: 36 100% 50% (Rich Amber)
  --muted: 40 10% 92%
  --destructive: 0 84% 60%
  --card: 0 0% 100%
  --border: 40 15% 88%
  --ring: 173 78% 26%

TYPOGRAPHY:
  Headings: "Space Grotesk" (400–700) — bold editorial feel
  Body: "DM Sans" (400–800) — clean, readable
  
EFFECTS:
  Glassmorphism on search bar, header
  Hover-reveal on product cards
  Pill-shaped inputs
  Subtle shadows & rounded-xl corners

LAYOUT (Desktop):
  6-column product grid (xl:grid-cols-6)
  Asymmetric hero carousel
  Login/Sign Up as permanent icon-label pairs in header
  COD-only focus in footer

═══════════════════════════════════════════════════════════════
👥 USER ROLES & AUTHENTICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4 Roles: admin, seller, customer, support_agent
Storage: user_roles table (NOT on profiles) — prevents privilege escalation
Auth: Supabase Auth with email/password + phone number (Pakistani +92 flag)
SSO: Cross-domain session sharing between subdomains
Email verification required (no auto-confirm)

Role Isolation:
  - Admin → /admin/* (AdminDashboardLayout + DynamicAdminSidebar)
  - Seller → /seller/* (SellerDashboardLayout)
  - Customer → /account/* (AccountLayout)
  - Agent → /agent/* (AgentDashboardLayout)

Protected Routes: ProtectedRoute component with allowedRoles prop
Super Admin: Can manage all roles, override permissions

═══════════════════════════════════════════════════════════════
📐 PAGE STRUCTURE & ROUTES
━━━━━━━━━━━━━━━━━━━━━━━━━

CUSTOMER PAGES:
  / — Homepage (HeroCarousel, Categories, FlashSale, JustForYou, RecentlyViewed)
  /products — Product listing with filters
  /product/:id — Product detail (gallery, variants, reviews, Q&A, recommendations)
  /category/:slug — Category page
  /search — Search with suggestions
  /compare — Product comparison (up to 4)
  /checkout — Multi-step checkout
  /order-success/:orderNumber — Order confirmation
  /store/:sellerId — Seller storefront (verified sellers only)
  /track-order — Order tracking
  /help — Help center
  /contact — Contact page
  /about, /careers, /terms, /privacy, /how-to-buy, /returns, /affiliate

CUSTOMER ACCOUNT (/account/*):
  profile, orders, orders/:orderId, wishlist, addresses,
  messages, notifications, wallet, referrals

ADMIN ROUTES (/admin/*):
  dashboard — Overview with stats cards
  sellers-management — 4-tab: Overview/Verified/Unverified/Rejected
  customers-management — Customer management
  agents-management — Agent overview
  agents/roles, agents/monitor, agents/salaries, agents/payouts
  orders — All orders with status management
  orders/direct — Admin store orders
  orders/vendor — Vendor marketplace orders
  cancellations, returns — Order issues
  products — Product catalog
  categories — Category management
  approvals — Product approval with commission setting
  seller-kyc, seller-kyc/:sellerId — KYC verification
  payouts — Seller payouts
  subscriptions — Seller billing plans
  flash-sales, flash-nominations — Flash sale campaigns
  reviews, qa — Content moderation
  vouchers — Discount codes
  banners — Hero banners
  analytics — Platform analytics
  site-settings — Social & contact info
  settings — Maintenance mode
  all-settings — Settings hub (16 categories)
  wallet — Admin wallet
  wallet-management — Financial overview
  commission-management — Commission rates
  commission-wallet — Commission earnings
  subscription-wallet — Subscription earnings
  pending-commissions — Settlement approvals
  balance-adjustments — Manual wallet adjustments
  payment-methods — Bank/JazzCash/EasyPaisa
  payment-settings — COD mode, per-order fees
  deposits/sellers, deposits/users, deposits/settings
  withdrawal-methods — Payout method management
  roles — Roles & permissions
  security — Audit logs
  store, store/products, store/orders, store/wallet — Admin's own store
  view-as/:userId — User detail viewer (read-only)
  tracking-search — Tracking number search
  bulk-uploads — Upload logs
  chat-shortcuts — Quick reply templates
  content-manager — Site content
  brand-assets — Logo & branding
  notifications — Push notifications

SELLER ROUTES (/seller/*):
  dashboard — Seller home (verified badge, KYC hidden when verified)
  kyc — KYC verification (redirects if verified)
  products — Product management with edit
  products/new, products/:productId/edit — Add/Edit product
  orders — Order management with status dropdown
  orders/cancelled — Cancelled orders
  wallet — Wallet with order-level transaction details
  analytics — Sales analytics
  reviews — Review management
  qa — Q&A management
  vouchers — Seller vouchers
  flash-sales — Flash sale applications
  marketing — Marketing tools
  returns — Return handling
  messages — Customer messaging
  bulk-upload — Bulk product upload
  settings — Seller settings

AGENT ROUTES (/agent/*):
  dashboard — Agent home
  chats — Support chat management
  earnings — Earnings & wallet
  performance — Performance metrics
  settings — Agent settings

PWA ROUTES (/admin-app/*, /seller-app/*, /customer-app/*):
  Mobile-optimized app shells with bottom navigation

═══════════════════════════════════════════════════════════════
🧱 COMPONENT ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━━━━

LAYOUT COMPONENTS:
  Header (MainHeader → desktop, MobileHeader → mobile)
  TopBar — Announcement bar
  CategoryNav — Desktop category navigation
  MobileBottomNav — Customer mobile nav
  Footer — Links, COD info
  AdminDashboardLayout + DynamicAdminSidebar — Admin layout
  SellerDashboardLayout — Seller layout
  AgentDashboardLayout — Agent layout
  AccountLayout — Customer account layout

UI COMPONENTS (shadcn/ui):
  Button (variants: default, destructive, outline, secondary, ghost, link)
  Card, Dialog, Sheet, Drawer, Tabs, Accordion
  Input, Select, Checkbox, Switch, RadioGroup, Textarea
  Table, Badge, Avatar, Tooltip, Popover, DropdownMenu
  ScrollArea, Separator, Progress, Skeleton
  Calendar, DatePicker, Carousel
  Command (combobox), NavigationMenu
  Toast (sonner), AlertDialog, ContextMenu, HoverCard
  Custom: LazyImage, OptimizedImage, ProductCardSkeleton, EmptyState, ConfettiEffect

PRODUCT COMPONENTS:
  ProductCard — 6-column grid card with hover effects
  MobileProductCard — Touch-optimized
  ProductGallery — Image gallery with zoom
  VariantSelector — Color/size selection
  ProductReviews, ProductQASection — UGC
  SocialShareButtons, AddToCompareButton
  RecommendedProducts — AI suggestions

CART & CHECKOUT:
  CartDrawer — Slide-out cart
  VoucherInput — Discount code validation
  MobileCartItem, SwipeToDelete — Mobile cart UX

SELLER COMPONENTS:
  KycStepper (Step1Business, Step2Identity, Step3Banking)
  VerifiedSellerGuard — Route protection
  SellerSubscriptionCard — Plan management
  MobileQuickEdit — Quick product edit
  VariantManager — Product variant management
  BrandCombobox — Brand selection

ADMIN COMPONENTS:
  DynamicAdminSidebar — Collapsible nav with pending badges
  PermissionGuard — Feature-level access control
  UserDetailViewer — Read-only user audit hub
  OrderStatusDropdown — Status management (Confirmed→Processing→Shipped→Delivered)
  BannerVisualEditor — WYSIWYG banner editing
  SystemAnnouncementManager — Global announcements
  SellerLeaderboard, SellerPerformanceCharts — Seller analytics
  DateRangeFilter, BulkActionsToolbar — Data management

═══════════════════════════════════════════════════════════════
💰 FINANCIAL SYSTEM
━━━━━━━━━━━━━━━━━━━

WALLETS:
  Admin Wallet — Platform earnings (commission + subscription fees), PIN protected
  Commission Wallet — Aggregated commission earnings
  Subscription Wallet — Subscription fee earnings
  Seller Wallet — Per-seller balance (earnings, fees, payouts)
  Customer Wallet — Refunds & deposits
  Agent Wallet — Salary & earnings
  Admin Store Wallet — Admin's own store earnings

COMMISSION SYSTEM:
  Per-product commission (fixed PKR or percentage)
  Set during product approval by admin
  Applies to all variants of the product
  On delivery → auto_create_settlement trigger creates order_settlements
  Admin approves settlement → settle_order_commission function:
    - Commission → commission_wallet
    - Remaining → seller_wallet
    - Notification to seller with order ID

SUBSCRIPTION SYSTEM:
  Plans: daily, half_monthly, monthly
  Per-day fee (global default or custom per seller)
  Free trial period for new verified sellers
  Auto-deduction from seller wallet
  Suspension on insufficient balance (products hidden)
  Auto-reactivation when balance restored

DEPOSITS:
  Manual deposit requests (screenshot upload)
  Admin approval/rejection flow
  Separate for sellers and customers

PAYOUTS:
  Seller withdrawal requests
  Agent payout requests
  Admin approval with transaction ID proof

PAYMENT:
  COD (Cash on Delivery) primary
  Wallet balance payment option
  Per-order fee (configurable)

═══════════════════════════════════════════════════════════════
📦 ORDER MANAGEMENT
━━━━━━━━━━━━━━━━━━━

STATUSES: pending → confirmed → processing → shipped → delivered
  Also: cancelled (immutable, with refund processing)

Features:
  - Real-time status updates (Supabase realtime)
  - OrderStatusDropdown for admin & seller
  - Customer sees status changes immediately
  - Cancel with auto-refund to customer wallet
  - Restock on cancellation
  - Return requests within 7 days of delivery
  - Order number format: FZN-ORD-XXXXX
  - Tracking ID & courier assignment on shipping
  - Direct orders (admin store) vs Vendor orders (marketplace)

═══════════════════════════════════════════════════════════════
🔥 MARKETING & PROMOTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━

Flash Sales:
  - Admin creates campaigns
  - Sellers nominate products (min 20% discount)
  - Fee deduction from seller wallet on approval
  - Time-slot based with stock limits

Vouchers:
  - Platform-wide discount codes
  - Percentage or fixed amount
  - Min spend, usage limits, expiry
  - Seller-specific vouchers

Banners:
  - Hero carousel banners
  - Visual editor with positioning
  - Mobile-specific banners

Daily Coupons:
  - Daily collectible discount coupons
  - Limited collections per coupon

Campaigns:
  - Themed campaigns with dedicated pages
  - Featured product collections

Coins & Rewards:
  - Earn coins on purchases
  - Redeem for discounts
  - Referral system

Spin Wheel:
  - Gamified reward system
  - Configurable prizes

═══════════════════════════════════════════════════════════════
🔧 ADMIN SIDEBAR NAVIGATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Collapsible dropdown groups with pending-only badges:

📊 Dashboard
🏪 Sellers → All Sellers, Seller KYC (badge), Seller Directory
👤 Customers → All Customers, User Directory
🎧 Agents → Overview, Assign Role, Online Monitor, Salaries, Payouts (badge)
📦 Orders → All Orders (badge), Direct Orders, Vendor Orders, Cancellations, Returns, Tracking
🛍️ Products → Catalog, Approvals (badge), Categories, Bulk Uploads
💰 Finance → Admin Wallet, Payouts (badge), Deposits (badge), Withdrawals (badge),
             Pending Commissions (badge), Commission Settings, Commission Wallet,
             Subscriptions, Payment Methods, Payment Settings
⚡ Flash Sales → Manage Sales, Nominations (badge)
📢 Marketing → Vouchers, Banners
⚙️ Content → Reviews, Q&A, Site Content, Brand Assets, Notifications, Chat Shortcuts, All Settings
🏪 Admin Store → Store Home, Products, Orders, Wallet
🔒 Security → Roles & Permissions, Security Settings, Analytics

Badges show ONLY pending items: KYC, product approvals, deposits, commissions, withdrawals

═══════════════════════════════════════════════════════════════
📱 MOBILE & PWA
━━━━━━━━━━━━━━━

PWA Features:
  - Installable with splash screen
  - Offline indicator
  - Pull to refresh
  - Swipe to delete (cart)
  - Bottom navigation per role
  - Mobile-optimized layouts

Mobile Components:
  MobileHomeLayout — Touch-first homepage
  MobileHeroBanner — Swipeable banners
  MobileCategoryGrid — Category icons
  MobileFlashSale — Horizontal scroll
  MobileProductGrid — 2-column grid
  MobileProductDetail — Full-screen product view
  MobileSearchOverlay — Full-screen search
  MobileActionBar — Sticky buy bar
  MobileStickyBar — Price + add to cart

═══════════════════════════════════════════════════════════════
🔐 SECURITY & PERMISSIONS
━━━━━━━━━━━━━━━━━━━━━━━━━

RBAC System:
  - user_roles table with app_role enum
  - PermissionsContext for feature-level access
  - PermissionGuard component
  - Super Admin overrides all restrictions
  - Activity logging (activity_logs table)
  - IP blocking (blocked_ips table)
  - Login session tracking
  - Admin inactivity auto-logout

RLS Policies:
  - Row Level Security on all tables
  - Security definer functions to prevent recursion
  - Proper role-based data access

═══════════════════════════════════════════════════════════════
💬 MESSAGING & SUPPORT
━━━━━━━━━━━━━━━━━━━━━━

Customer ↔ Seller:
  - Direct messaging via conversations table
  - Chat window with real-time messages
  - Product-specific conversations

Support Chat:
  - Customer initiates support session
  - Agent assignment (online agents notified)
  - Chat shortcuts for quick replies
  - Rating & feedback after session
  - Agent performance tracking

Chatbot:
  - FAQ-based auto-responses
  - Keyword matching
  - Fallback to live agent

WhatsApp:
  - Floating WhatsApp button
  - Configurable phone number

Notifications:
  - In-app notifications (bell icon)
  - Push notification support
  - System, promotion, wallet, order notification types
  - Real-time delivery via Supabase subscriptions

═══════════════════════════════════════════════════════════════
🗄️ KEY DATABASE TABLES
━━━━━━━━━━━━━━━━━━━━━━

Users & Auth: profiles, user_roles, seller_profiles, login_sessions
Products: products, product_variants, product_commissions, categories, brands
Orders: orders, order_items, order_settlements, cancellation_logs
Finance: seller_wallets, wallet_transactions, admin_wallet, admin_wallet_transactions,
         commission_wallet, commission_transactions, customer_wallets,
         customer_wallet_transactions, agent_wallets, agent_wallet_transactions,
         deposit_requests, payout_requests, agent_payouts, financial_logs
Subscriptions: seller_subscriptions, subscription_deduction_logs
Marketing: flash_sales, flash_sale_nominations, vouchers, voucher_usage,
           collected_vouchers, campaigns, campaign_products, daily_coupons,
           hero_banners, sponsored_products
Content: product_reviews, product_questions, product_answers, chatbot_faqs
Messaging: conversations, messages, support_chat_sessions, support_chat_messages
Settings: admin_settings, site_settings, payment_methods, withdrawal_methods,
          chat_shortcuts, admin_store_settings
Security: activity_logs, blocked_ips, notifications
Returns: return_requests

═══════════════════════════════════════════════════════════════
🚀 EDGE FUNCTIONS
━━━━━━━━━━━━━━━━━

process-subscriptions — Auto-deduct subscription fees
scan-image — Image moderation
send-contact-email — Contact form emails
send-kyc-status-email — KYC approval/rejection notifications
send-order-emails — Order confirmation emails

═══════════════════════════════════════════════════════════════
📊 SEO & PERFORMANCE
━━━━━━━━━━━━━━━━━━━━

SEO: SEOHead component, JSON-LD (Product, Organization, Breadcrumb)
Images: LazyImage with IntersectionObserver, OptimizedImage
Data: React Query with staleTime optimization, infinite scroll
Prefetch: PrefetchLink for route preloading
Skeleton: ProductCardSkeleton, SkeletonCard for loading states

═══════════════════════════════════════════════════════════════
END OF FANZON PLATFORM BLUEPRINT
═══════════════════════════════════════════════════════════════
`.trim();

const AdminPlatformBlueprintPage = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(blueprintText);
      setCopied(true);
      toast.success("Blueprint copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Platform Blueprint
          </h1>
          <p className="text-muted-foreground text-sm">
            Complete FANZON marketplace specification — copy as a prompt
          </p>
        </div>
        <Button onClick={handleCopy} size="lg" className="gap-2">
          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          {copied ? "Copied!" : "Copy Blueprint"}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Full Platform Prompt</span>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-xs leading-relaxed font-mono bg-muted/50 p-4 rounded-lg max-h-[70vh] overflow-y-auto border">
            {blueprintText}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPlatformBlueprintPage;
