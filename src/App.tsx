import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ImpersonationProvider } from "@/contexts/ImpersonationContext";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";
import { CartProvider } from "@/contexts/CartContext";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { VisualEditProvider } from "@/contexts/VisualEditContext";
import AuthModal from "@/components/auth/AuthModal";
import CrossDomainAuthRedirector from "@/components/auth/CrossDomainAuthRedirector";
import CrossDomainSessionReceiver from "@/components/auth/CrossDomainSessionReceiver";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MaintenanceGuard from "@/components/MaintenanceGuard"; // force rebuild
import ErrorBoundary from "@/components/ErrorBoundary";
import OfflineIndicator from "@/components/OfflineIndicator";
import OrderStatusNotification from "./components/orders/OrderStatusNotification";
import ComparisonBar from "./components/comparison/ComparisonBar";
import VisualEditToggle from "./components/admin/VisualEditToggle";
// BackToDashboardBar removed - strict role isolation
import Index from "./pages/Index";

import SellerAuth from "./pages/seller/SellerAuth";
import BusinessAuth from "./pages/business/BusinessAuth";
import EmailVerificationPending from "./pages/business/EmailVerificationPending";
import EmailVerificationSuccess from "./pages/business/EmailVerificationSuccess";
import CustomerAuth from "./pages/auth/CustomerAuth";
import CustomerEmailVerification from "./pages/auth/CustomerEmailVerification";
import QRLoginPage from "./pages/auth/QRLoginPage";
import ResetPassword from "./pages/ResetPassword";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import CategoryPage from "./pages/CategoryPage";
import ComparePage from "./pages/ComparePage";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";
import HelpCenter from "./pages/HelpCenter";
import ContactUs from "./pages/ContactUs";
import SupportChatWidget from "./components/support/SupportChatWidget";
import WhatsAppFloatingButton from "./components/WhatsAppFloatingButton";
import InstallPrompt from "./components/pwa/InstallPrompt";
import NotificationPermissionBanner from "./components/notifications/NotificationPermissionBanner";
import MobileFloatingBackButton from "./components/mobile/MobileFloatingBackButton";
import SplashScreen from "./components/pwa/SplashScreen";
import QRConfirmPage from "./pages/QRConfirmPage";
import { useAdminInactivityLogout } from "./hooks/useAdminInactivityLogout";
import { useLoginTracking } from "./hooks/useLoginTracking";
import { useIsMobile } from "./hooks/use-mobile";

// Account Pages
import AccountLayout from "./components/account/AccountLayout";
import ProfilePage from "./pages/account/ProfilePage";
import OrdersPage from "./pages/account/OrdersPage";
import OrderDetailPage from "./pages/account/OrderDetailPage";
import WishlistPage from "./pages/account/WishlistPage";
import AddressesPage from "./pages/account/AddressesPage";
import CustomerMessagesPage from "./pages/account/MessagesPage";
import NotificationsPage from "./pages/account/NotificationsPage";
import WalletPage from "./pages/account/WalletPage";
import LoginDevicesPage from "./pages/account/LoginDevicesPage";

// New Mobile-First Dashboard Pages
import AdminDashboardLayout from "./components/dashboard/AdminDashboardLayout";
import SellerDashboardLayout from "./components/dashboard/SellerDashboardLayout";
import DashboardPageWrapper from "./components/layout/DashboardPageWrapper";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { PermissionsProvider } from "@/contexts/PermissionsContext";
import AdminDashboardHome from "./pages/dashboard/AdminDashboardHome";
import SellerDashboardHome from "./pages/seller/SellerDashboardHome";

// Admin Sub-Pages (reused from old structure)
import AdminOrderManagement from "./pages/dashboard/OrderManagement";
import AdminProductCatalog from "./pages/dashboard/ProductCatalog";
import AdminCategoryManager from "./pages/dashboard/AdminCategoryManager";
import AdminProductApprovals from "./pages/dashboard/AdminProductApprovals";
import AdminPendingCommissionsPage from "./pages/dashboard/AdminPendingCommissionsPage";
import AdminTrackingSearchPage from "./pages/dashboard/AdminTrackingSearchPage";
import SellerApprovals from "./pages/dashboard/SellerApprovals";
import AdminSettings from "./pages/dashboard/DashboardSettings";
import AdminSellerKyc from "./pages/dashboard/AdminSellerKyc";
import AdminSellerDetail from "./pages/dashboard/AdminSellerDetail";
import AdminPayoutManagement from "./pages/dashboard/AdminPayoutManagement";
// FlashSaleManager removed
import VoucherManager from "./pages/dashboard/VoucherManager";
import BannerManager from "./pages/dashboard/BannerManager";
import AdminBulkUploadLogs from "./pages/dashboard/AdminBulkUploadLogs";
import AdminCancellationsPage from "./pages/dashboard/AdminCancellationsPage";
import AdminReturnsPage from "./pages/dashboard/AdminReturnsPage";
import AdminUserDirectory from "./pages/dashboard/AdminUserDirectory";
import AdminSellersDirectory from "./pages/dashboard/AdminSellersDirectory";
import AdminSellerDetailPage from "./pages/dashboard/AdminSellerDetailPage";
import AdminRolesPage from "./pages/dashboard/AdminRolesPage";
import SocialSettingsPage from "./pages/dashboard/SocialSettingsPage";
import AdminAnalyticsPage from "./pages/dashboard/AdminAnalyticsPage";
import AdminReviewsPage from "./pages/dashboard/AdminReviewsPage";
// AdminFlashNominations removed
import AdminQAModerationPage from "./pages/dashboard/AdminQAModerationPage";
import AdminCancelledOrdersPage from "./pages/admin/AdminCancelledOrdersPage";
import AdminSubscriptionPage from "./pages/dashboard/AdminSubscriptionPage";
import AdminDepositSettings from "./pages/dashboard/AdminDepositSettings";
import AdminSellerDepositsPage from "./pages/dashboard/AdminSellerDepositsPage";
import AdminUserDepositsPage from "./pages/dashboard/AdminUserDepositsPage";
import AdminBalanceAdjustmentsPage from "./pages/dashboard/AdminBalanceAdjustmentsPage";
import AdminPaymentMethodsPage from "./pages/dashboard/AdminPaymentMethodsPage";
import AdminWithdrawalMethodsPage from "./pages/dashboard/AdminWithdrawalMethodsPage";
import AdminPaymentSettingsPage from "./pages/dashboard/AdminPaymentSettingsPage";
import AdminAllSettingsPage from "./pages/dashboard/AdminAllSettingsPage";
import AdminDirectOrdersPage from "./pages/dashboard/AdminDirectOrdersPage";
import AdminSellerOrdersPage from "./pages/dashboard/AdminSellerOrdersPage";
import AdminChatShortcutsPage from "./pages/dashboard/AdminChatShortcutsPage";
import AdminSiteContentPage from "./pages/dashboard/AdminSiteContentPage";
import AdminBrandAssetsPage from "./pages/dashboard/AdminBrandAssetsPage";
import AdminNotificationsPage from "./pages/dashboard/AdminNotificationsPage";
import AdminCommissionManagementPage from "./pages/dashboard/AdminCommissionManagementPage";
import AdminWalletPage from "./pages/dashboard/AdminWalletPage";
import AdminCommissionWalletPage from "./pages/dashboard/AdminCommissionWalletPage";
import AdminSubscriptionWalletPage from "./pages/dashboard/AdminSubscriptionWalletPage";
import AdminWalletManagementPage from "./pages/dashboard/AdminWalletManagementPage";
import AdminSellersManagement from "./pages/dashboard/AdminSellersManagement";
import AdminCustomersManagement from "./pages/dashboard/AdminCustomersManagement";
import AdminAgentsManagement from "./pages/dashboard/AdminAgentsManagement";
import AdminAgentOnlineMonitor from "./pages/dashboard/AdminAgentOnlineMonitor";
import AdminAgentSalaryPage from "./pages/dashboard/AdminAgentSalaryPage";
import AdminAgentPayoutsPage from "./pages/dashboard/AdminAgentPayoutsPage";
import AdminAgentRolePage from "./pages/dashboard/AdminAgentRolePage";
import AdminStorePage from "./pages/dashboard/AdminStorePage";
import AdminStoreProductsPage from "./pages/dashboard/AdminStoreProductsPage";
import AdminStoreWalletPage from "./pages/dashboard/AdminStoreWalletPage";
import AdminStoreOrdersPage from "./pages/dashboard/AdminStoreOrdersPage";
import AdminStoreAddProductPage from "./pages/dashboard/AdminStoreAddProductPage";
import AdminPlatformBlueprintPage from "./pages/dashboard/AdminPlatformBlueprintPage";
import AdminApkBuildPage from "./pages/dashboard/AdminApkBuildPage";
import AdminDesktopAppPage from "./pages/dashboard/AdminDesktopAppPage";
import SellerDesktopAppPage from "./pages/dashboard/SellerDesktopAppPage";
import SellerModuleLayout from "./components/admin/modules/SellerModuleLayout";
import CustomerModuleLayout from "./components/admin/modules/CustomerModuleLayout";
import AgentModuleLayout from "./components/admin/modules/AgentModuleLayout";
import SellerModuleHome from "./pages/admin/modules/SellerModuleHome";
import CustomerModuleHome from "./pages/admin/modules/CustomerModuleHome";
import AgentModuleHome from "./pages/admin/modules/AgentModuleHome";

// Seller Sub-Pages
import SellerKyc from "./pages/seller/SellerKyc";
import SellerWalletPage from "./pages/seller/SellerWalletPage";
import SellerMessagesPage from "./pages/seller/SellerMessagesPage";
import SellerAnalyticsPage from "./pages/seller/SellerAnalyticsPage";
import VerifiedSellerGuard from "./components/seller/VerifiedSellerGuard";
// SellerFlashSalePage removed
import SellerReviewsPage from "./pages/seller/SellerReviewsPage";
import SellerVouchersPage from "./pages/seller/SellerVouchersPage";
import SellerBulkUploadPage from "./pages/seller/SellerBulkUploadPage";
import SellerProductsPage from "./pages/seller/SellerProductsPage";
import SellerAddProductPage from "./pages/seller/SellerAddProductPage";
import SellerReturnsPage from "./pages/seller/SellerReturnsPage";
import SellerQAPage from "./pages/seller/SellerQAPage";
import SellerCancelledOrdersPage from "./pages/seller/SellerCancelledOrdersPage";
import SellerSettingsPage from "./pages/seller/SellerSettingsPage";
import SellerFeeGuidePage from "./pages/seller/SellerFeeGuidePage";
import TrackOrder from "./pages/TrackOrder";
import SystemAnnouncementBanner from "./components/admin/SystemAnnouncementBanner";
import SellerStorefront from "./pages/SellerStorefront";
import ReferralPage from "./pages/account/ReferralPage";
import AboutPage from "./pages/AboutPage";
import CareersPage from "./pages/CareersPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import HowToBuyPage from "./pages/HowToBuyPage";
import ReturnsPage from "./pages/ReturnsPage";
import AffiliatePage from "./pages/AffiliatePage";
import VendorSupportPage from "./pages/VendorSupportPage";
import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentDashboardHome from "./pages/agent/AgentDashboardHome";
import AgentChatsPage from "./pages/agent/AgentChatsPage";
import AgentEarningsPage from "./pages/agent/AgentEarningsPage";
import AgentSettingsPage from "./pages/agent/AgentSettingsPage";
import AgentPerformancePage from "./pages/agent/AgentPerformancePage";
import AgentDashboardLayout from "./components/dashboard/AgentDashboardLayout";
import AdminSecurityPage from "./pages/dashboard/AdminSecurityPage";
import AdminViewAsPage from "./pages/dashboard/AdminViewAsPage";

// PWA App Shells
import CustomerAppShell from "./components/pwa/CustomerAppShell";
import SellerAppShell from "./components/pwa/SellerAppShell";
import AdminAppShell from "./components/pwa/AdminAppShell";
import AgentAppShell from "./components/pwa/AgentAppShell";
import CustomerAppHome from "./pages/pwa/CustomerAppHome";

import ScrollToTop from "./components/ScrollToTop";
import { getDomainRole, getDefaultPathForRole, isProductionDomain } from "./utils/domainRouting";

const domainRole = getDomainRole();
const devAllowsAll = !isProductionDomain();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global stale-while-revalidate defaults
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes cache
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// On mobile, /account shows the menu grid; on desktop, redirect to /account/profile
const AccountIndexRedirect = () => {
  const isMobile = useIsMobile();
  if (isMobile) return null; // AccountLayout handles mobile menu
  return <Navigate to="/account/profile" replace />;
};

// Admin page wrapper component
const AdminPageWrapper = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <PermissionsProvider>
    <DashboardProvider>
      <DashboardPageWrapper title={title} backHref="/admin/dashboard">
        {children}
      </DashboardPageWrapper>
    </DashboardProvider>
  </PermissionsProvider>
);
// Seller page wrapper component
const SellerPageWrapper = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <DashboardProvider>
    <DashboardPageWrapper title={title} backHref="/seller/dashboard">
      {children}
    </DashboardPageWrapper>
  </DashboardProvider>
);

// Wrapper to call hooks inside AuthProvider
const AdminInactivityGuard = () => {
  useAdminInactivityLogout();
  return null;
};

// Login tracking wrapper
const LoginTracker = () => {
  useLoginTracking();
  return null;
};

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
           <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
           <AuthProvider>
             <ImpersonationProvider>
              <VisualEditProvider>
                <CartProvider>
                  <ComparisonProvider>
                    <OrderStatusNotification>
                      <MaintenanceGuard>
                        <TooltipProvider>
                          <Toaster />
                          <Sonner />
                          <OfflineIndicator />
                          <SplashScreen />
                          <BrowserRouter>
                          <ImpersonationBanner />
                          <SystemAnnouncementBanner />
                          <ScrollToTop />
                          {/* Strict role isolation - no cross-role features */}
                          <InstallPrompt />
                          <NotificationPermissionBanner />
                          <AdminInactivityGuard />
                          <LoginTracker />
                          <AuthModal />
                          <CrossDomainSessionReceiver />
                          <CrossDomainAuthRedirector />
                          <SupportChatWidget />
                          <WhatsAppFloatingButton />
                          <ComparisonBar />
                          <MobileFloatingBackButton />
                          <VisualEditToggle />
                          <Routes>
                          {/* Domain-based root redirect for subdomains */}
                          {domainRole !== 'main' ? (
                            <Route path="/" element={<Navigate to={getDefaultPathForRole(domainRole)} replace />} />
                          ) : (
                            <Route path="/" element={<Index />} />
                          )}
                          
                          {/* Customer Auth Routes - /auth/* */}
                          <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
                          <Route path="/auth/login" element={<CustomerAuth />} />
                          <Route path="/auth/signup" element={<CustomerAuth />} />
                          <Route path="/auth/verify-email" element={<CustomerEmailVerification />} />
                          <Route path="/auth/qr-login" element={<QRLoginPage />} />
                          
                          {/* Business Partner Auth Routes - /business/* */}
                          <Route path="/business/login" element={<BusinessAuth />} />
                          <Route path="/business/signup" element={<BusinessAuth />} />
                          <Route path="/business/verify-email-pending" element={<EmailVerificationPending />} />
                          <Route path="/business/verify-email-success" element={<EmailVerificationSuccess />} />
                          
                          {/* Legacy Seller Auth Routes - Redirect to /business/* */}
                          <Route path="/seller/login" element={<SellerAuth />} />
                          <Route path="/seller/signup" element={<SellerAuth />} />
                          
                          {/* Password Reset Route */}
                          <Route path="/reset-password" element={<ResetPassword />} />
                          
                          {/* Public storefront routes - main & customer domains */}
                          {(domainRole === 'main' || domainRole === 'customer') && (
                            <>
                              <Route path="/products" element={<ProductListing />} />
                              <Route path="/category/:slug" element={<CategoryPage />} />
                              <Route path="/search" element={<ProductListing />} />
                              <Route path="/product/:id" element={<ProductDetail />} />
                              <Route path="/compare" element={<ComparePage />} />
                              <Route path="/help" element={<HelpCenter />} />
                              <Route path="/contact" element={<ContactUs />} />
                              <Route path="/track-order" element={<TrackOrder />} />
                              <Route path="/store/:sellerId" element={<SellerStorefront />} />
                              <Route path="/about" element={<AboutPage />} />
                              <Route path="/careers" element={<CareersPage />} />
                              <Route path="/terms" element={<TermsPage />} />
                              <Route path="/privacy" element={<PrivacyPage />} />
                              <Route path="/how-to-buy" element={<HowToBuyPage />} />
                              <Route path="/returns" element={<ReturnsPage />} />
                              <Route path="/affiliate" element={<AffiliatePage />} />
                              <Route path="/vendor-support" element={<VendorSupportPage />} />
                              
                              {/* Checkout Routes */}
                              <Route 
                                path="/checkout" 
                                element={
                                  <ProtectedRoute>
                                    <Checkout />
                                  </ProtectedRoute>
                                }
                              />
                              <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
                            </>
                          )}
                          
                          {/* Customer Account Routes - main & customer domains */}
                          {(domainRole === 'main' || domainRole === 'customer') && (
                            <>
                              <Route 
                                path="/account" 
                                element={
                                  <ProtectedRoute>
                                    <AccountLayout />
                                  </ProtectedRoute>
                                }
                              >
                                <Route index element={<AccountIndexRedirect />} />
                                <Route path="profile" element={<ProfilePage />} />
                                <Route path="orders" element={<OrdersPage />} />
                                <Route path="orders/:orderId" element={<OrderDetailPage />} />
                                <Route path="wishlist" element={<WishlistPage />} />
                                <Route path="addresses" element={<AddressesPage />} />
                                <Route path="messages" element={<CustomerMessagesPage />} />
                                <Route path="notifications" element={<NotificationsPage />} />
                                <Route path="wallet" element={<WalletPage />} />
                                <Route path="referrals" element={<ReferralPage />} />
                                <Route path="devices" element={<LoginDevicesPage />} />
                              </Route>
                              <Route path="/my-orders" element={<Navigate to="/account/orders" replace />} />
                            </>
                          )}
                          
                           {/* Admin Routes - admin domain (and dev/preview) */}
                           {((domainRole === 'admin') || devAllowsAll) && (
                             <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboardLayout /></ProtectedRoute>}>
                               <Route path="dashboard" element={<AdminDashboardHome />} />
                              <Route path="sellers-management" element={<AdminSellersManagement />} />
                              <Route path="customers-management" element={<AdminCustomersManagement />} />
                              <Route path="agents-management" element={<AdminAgentsManagement />} />
                              <Route path="agents/roles" element={<AdminAgentRolePage />} />
                              <Route path="agents/monitor" element={<AdminAgentOnlineMonitor />} />
                              <Route path="agents/salaries" element={<AdminAgentSalaryPage />} />
                              <Route path="agents/payouts" element={<AdminAgentPayoutsPage />} />
                              <Route path="orders-management" element={<Navigate to="/admin/orders" replace />} />
                              <Route path="products-management" element={<Navigate to="/admin/products" replace />} />
                              <Route path="finance-management" element={<Navigate to="/admin/wallet-management" replace />} />
                              <Route path="marketing-management" element={<Navigate to="/admin/vouchers" replace />} />
                              <Route path="content-management" element={<Navigate to="/admin/reviews" replace />} />
                              <Route path="security-management" element={<Navigate to="/admin/roles" replace />} />
                              <Route path="users" element={<AdminUserDirectory />} />
                              <Route path="sellers" element={<AdminSellersDirectory />} />
                              <Route path="sellers/:sellerId" element={<AdminSellerDetailPage />} />
                              <Route path="roles" element={<AdminRolesPage />} />
                              <Route path="orders" element={<AdminOrderManagement />} />
                              <Route path="orders/direct" element={<AdminDirectOrdersPage />} />
                              <Route path="orders/vendor" element={<AdminSellerOrdersPage />} />
                              <Route path="seller-orders" element={<AdminSellerOrdersPage />} />
                              <Route path="cancellations" element={<AdminCancellationsPage />} />
                              <Route path="cancelled" element={<AdminCancelledOrdersPage />} />
                              <Route path="orders/cancelled" element={<AdminCancelledOrdersPage />} />
                              <Route path="returns" element={<AdminReturnsPage />} />
                              <Route path="products" element={<AdminProductCatalog />} />
                              <Route path="categories" element={<AdminCategoryManager />} />
                              <Route path="approvals" element={<AdminProductApprovals />} />
                              <Route path="seller-kyc" element={<AdminSellerKyc />} />
                              <Route path="seller-kyc/:sellerId" element={<AdminSellerDetail />} />
                              <Route path="payouts" element={<AdminPayoutManagement />} />
                              <Route path="subscriptions" element={<AdminSubscriptionPage />} />
                              {/* Flash sales removed */}
                              <Route path="reviews" element={<AdminReviewsPage />} />
                              <Route path="qa" element={<AdminQAModerationPage />} />
                              <Route path="vouchers" element={<VoucherManager />} />
                              <Route path="banners" element={<BannerManager />} />
                              <Route path="bulk-uploads" element={<AdminBulkUploadLogs />} />
                              <Route path="analytics" element={<AdminAnalyticsPage />} />
                              <Route path="site-settings" element={<SocialSettingsPage />} />
                              <Route path="settings" element={<AdminSettings />} />
                              <Route path="deposits/sellers" element={<AdminSellerDepositsPage />} />
                              <Route path="deposits/users" element={<AdminUserDepositsPage />} />
                              <Route path="deposits/settings" element={<AdminDepositSettings />} />
                              <Route path="balance-adjustments" element={<AdminBalanceAdjustmentsPage />} />
                              <Route path="payment-methods" element={<AdminPaymentMethodsPage />} />
                              <Route path="payment-settings" element={<AdminPaymentSettingsPage />} />
                              <Route path="all-settings" element={<AdminAllSettingsPage />} />
                              <Route path="chat-shortcuts" element={<AdminChatShortcutsPage />} />
                              <Route path="content-manager" element={<AdminSiteContentPage />} />
                              <Route path="brand-assets" element={<AdminBrandAssetsPage />} />
                              <Route path="notifications" element={<AdminNotificationsPage />} />
                              <Route path="commission-management" element={<AdminCommissionManagementPage />} />
                              <Route path="commission-wallet" element={<AdminCommissionWalletPage />} />
                              <Route path="subscription-wallet" element={<AdminSubscriptionWalletPage />} />
                              <Route path="wallet" element={<AdminWalletPage />} />
                              <Route path="wallet-management" element={<AdminWalletManagementPage />} />
                              <Route path="withdrawal-methods" element={<AdminWithdrawalMethodsPage />} />
                              <Route path="security" element={<AdminSecurityPage />} />
                              <Route path="store" element={<AdminStorePage />} />
                              <Route path="store/products" element={<AdminStoreProductsPage />} />
                              <Route path="store/products/new" element={<AdminStoreAddProductPage />} />
                              <Route path="store/wallet" element={<AdminStoreWalletPage />} />
                              <Route path="store/orders" element={<AdminStoreOrdersPage />} />
                              <Route path="pending-commissions" element={<AdminPendingCommissionsPage />} />
                              <Route path="tracking-search" element={<AdminTrackingSearchPage />} />
                              <Route path="view-as/:userId" element={<AdminViewAsPage />} />
                              <Route path="platform-blueprint" element={<AdminPlatformBlueprintPage />} />
                              <Route path="apk-build" element={<AdminApkBuildPage />} />
                              <Route path="desktop-app" element={<AdminDesktopAppPage />} />
                            </Route>
                          )}

                          {/* Admin Module Dashboards */}
                          {((domainRole === 'admin') || devAllowsAll) && (
                            <>
                              {/* Seller Module */}
                              <Route path="/admin/module/sellers" element={<ProtectedRoute allowedRoles={["admin"]}><SellerModuleLayout /></ProtectedRoute>}>
                                <Route index element={<SellerModuleHome />} />
                                <Route path="directory" element={<AdminSellersDirectory />} />
                                <Route path="kyc" element={<AdminSellerKyc />} />
                                <Route path="kyc/:sellerId" element={<AdminSellerDetail />} />
                                <Route path="orders" element={<AdminOrderManagement />} />
                                <Route path="vendor-orders" element={<AdminSellerOrdersPage />} />
                                <Route path="approvals" element={<AdminProductApprovals />} />
                                <Route path="bulk-uploads" element={<AdminBulkUploadLogs />} />
                                {/* Flash nominations removed */}
                                <Route path="deposits" element={<AdminSellerDepositsPage />} />
                                <Route path="payouts" element={<AdminPayoutManagement />} />
                                <Route path="commissions" element={<AdminPendingCommissionsPage />} />
                                <Route path="subscriptions" element={<AdminSubscriptionPage />} />
                                <Route path="reviews" element={<AdminReviewsPage />} />
                                <Route path="returns" element={<AdminReturnsPage />} />
                                <Route path="cancellations" element={<AdminCancellationsPage />} />
                                <Route path="chat-shortcuts" element={<AdminChatShortcutsPage />} />
                              </Route>

                              {/* Customer Module */}
                              <Route path="/admin/module/customers" element={<ProtectedRoute allowedRoles={["admin"]}><CustomerModuleLayout /></ProtectedRoute>}>
                                <Route index element={<CustomerModuleHome />} />
                                <Route path="directory" element={<AdminUserDirectory />} />
                                <Route path="orders" element={<AdminOrderManagement />} />
                                <Route path="deposits" element={<AdminUserDepositsPage />} />
                                <Route path="wallets" element={<AdminBalanceAdjustmentsPage />} />
                                <Route path="returns" element={<AdminReturnsPage />} />
                                <Route path="reviews" element={<AdminReviewsPage />} />
                                <Route path="notifications" element={<AdminNotificationsPage />} />
                              </Route>

                              {/* Agent Module */}
                              <Route path="/admin/module/agents" element={<ProtectedRoute allowedRoles={["admin"]}><AgentModuleLayout /></ProtectedRoute>}>
                                <Route index element={<AgentModuleHome />} />
                                <Route path="roles" element={<AdminAgentRolePage />} />
                                <Route path="monitor" element={<AdminAgentOnlineMonitor />} />
                                <Route path="salaries" element={<AdminAgentSalaryPage />} />
                                <Route path="payouts" element={<AdminAgentPayoutsPage />} />
                                <Route path="chats" element={<AdminAgentsManagement />} />
                              </Route>
                            </>
                          )}

                           {/* Seller Routes - seller domain (and dev/preview) */}
                           {((domainRole === 'seller') || devAllowsAll) && (
                             <Route path="/seller" element={<ProtectedRoute allowedRoles={["seller"]}><SellerDashboardLayout /></ProtectedRoute>}>
                               <Route path="dashboard" element={<SellerDashboardHome />} />
                              <Route path="kyc" element={<SellerKyc />} />
                              <Route path="products" element={<VerifiedSellerGuard><SellerProductsPage /></VerifiedSellerGuard>} />
                              <Route path="products/new" element={<VerifiedSellerGuard><SellerAddProductPage /></VerifiedSellerGuard>} />
                              <Route path="products/:productId/edit" element={<VerifiedSellerGuard><SellerAddProductPage /></VerifiedSellerGuard>} />
                              <Route path="orders" element={<VerifiedSellerGuard><AdminOrderManagement /></VerifiedSellerGuard>} />
                              <Route path="vouchers" element={<VerifiedSellerGuard><SellerVouchersPage /></VerifiedSellerGuard>} />
                              <Route path="reviews" element={<SellerReviewsPage />} />
                              <Route path="qa" element={<VerifiedSellerGuard><SellerQAPage /></VerifiedSellerGuard>} />
                              <Route path="bulk-upload" element={<VerifiedSellerGuard><SellerBulkUploadPage /></VerifiedSellerGuard>} />
                              {/* Flash sale removed */}
                              <Route path="messages" element={<VerifiedSellerGuard><SellerMessagesPage /></VerifiedSellerGuard>} />
                              <Route path="wallet" element={<VerifiedSellerGuard><SellerWalletPage /></VerifiedSellerGuard>} />
                              <Route path="analytics" element={<VerifiedSellerGuard><SellerAnalyticsPage /></VerifiedSellerGuard>} />
                              <Route path="returns" element={<VerifiedSellerGuard><SellerReturnsPage /></VerifiedSellerGuard>} />
                              <Route path="cancelled" element={<VerifiedSellerGuard><SellerCancelledOrdersPage /></VerifiedSellerGuard>} />
                              <Route path="settings" element={<SellerSettingsPage />} />
                              <Route path="fee-guide" element={<SellerFeeGuidePage />} />
                              <Route path="desktop-app" element={<SellerDesktopAppPage />} />
                            </Route>
                          )}

                           {/* Support Agent Routes - agent domain (and dev/preview) */}
                           {((domainRole === 'agent') || devAllowsAll) && (
                             <Route path="/agent" element={<AgentDashboardLayout />}>
                               <Route path="dashboard" element={<AgentDashboardHome />} />
                              <Route path="chats" element={<AgentChatsPage />} />
                              <Route path="earnings" element={<AgentEarningsPage />} />
                              <Route path="performance" element={<AgentPerformancePage />} />
                              <Route path="settings" element={<AgentSettingsPage />} />
                            </Route>
                          )}

                          {/* === PWA Mobile Apps === */}
                          {/* Customer App - /app - main & customer domains */}
                          {(domainRole === 'main' || domainRole === 'customer') && (
                            <Route path="/app" element={<CustomerAppShell />}>
                              <Route index element={<CustomerAppHome />} />
                              <Route path="orders" element={<OrdersPage />} />
                              <Route path="orders/:orderId" element={<OrderDetailPage />} />
                              <Route path="wishlist" element={<WishlistPage />} />
                              <Route path="messages" element={<CustomerMessagesPage />} />
                              <Route path="wallet" element={<WalletPage />} />
                              <Route path="profile" element={<ProfilePage />} />
                              <Route path="addresses" element={<AddressesPage />} />
                              <Route path="notifications" element={<NotificationsPage />} />
                              <Route path="referrals" element={<ReferralPage />} />
                            </Route>
                          )}

                           {/* Seller App - /seller-app - seller domain (and dev/preview) */}
                           {((domainRole === 'seller') || devAllowsAll) && (
                             <Route path="/seller-app" element={<SellerAppShell />}>
                               <Route index element={<SellerDashboardHome />} />
                              <Route path="products" element={<VerifiedSellerGuard><SellerProductsPage /></VerifiedSellerGuard>} />
                              <Route path="products/new" element={<VerifiedSellerGuard><SellerAddProductPage /></VerifiedSellerGuard>} />
                              <Route path="products/:productId/edit" element={<VerifiedSellerGuard><SellerAddProductPage /></VerifiedSellerGuard>} />
                              <Route path="orders" element={<VerifiedSellerGuard><AdminOrderManagement /></VerifiedSellerGuard>} />
                              <Route path="wallet" element={<VerifiedSellerGuard><SellerWalletPage /></VerifiedSellerGuard>} />
                              <Route path="messages" element={<VerifiedSellerGuard><SellerMessagesPage /></VerifiedSellerGuard>} />
                              <Route path="analytics" element={<VerifiedSellerGuard><SellerAnalyticsPage /></VerifiedSellerGuard>} />
                              <Route path="reviews" element={<SellerReviewsPage />} />
                              <Route path="vouchers" element={<VerifiedSellerGuard><SellerVouchersPage /></VerifiedSellerGuard>} />
                              <Route path="returns" element={<VerifiedSellerGuard><SellerReturnsPage /></VerifiedSellerGuard>} />
                              <Route path="cancelled" element={<VerifiedSellerGuard><SellerCancelledOrdersPage /></VerifiedSellerGuard>} />
                              {/* Flash sale removed */}
                              <Route path="bulk-upload" element={<VerifiedSellerGuard><SellerBulkUploadPage /></VerifiedSellerGuard>} />
                              <Route path="settings" element={<SellerSettingsPage />} />
                              <Route path="fee-guide" element={<SellerFeeGuidePage />} />
                              <Route path="kyc" element={<SellerKyc />} />
                            </Route>
                          )}

                           {/* Admin App - /admin-app - admin domain (and dev/preview) */}
                           {((domainRole === 'admin') || devAllowsAll) && (
                             <Route path="/admin-app" element={<AdminAppShell />}>
                               <Route index element={<AdminDashboardHome />} />
                              <Route path="sellers-management" element={<AdminSellersManagement />} />
                              <Route path="customers-management" element={<AdminCustomersManagement />} />
                              <Route path="agents-management" element={<AdminAgentsManagement />} />
                              <Route path="agents/roles" element={<AdminAgentRolePage />} />
                              <Route path="agents/monitor" element={<AdminAgentOnlineMonitor />} />
                              <Route path="agents/salaries" element={<AdminAgentSalaryPage />} />
                              <Route path="agents/payouts" element={<AdminAgentPayoutsPage />} />
                              <Route path="orders-management" element={<Navigate to="/admin-app/orders" replace />} />
                              <Route path="products-management" element={<Navigate to="/admin-app/products" replace />} />
                              <Route path="finance-management" element={<Navigate to="/admin-app/wallet-management" replace />} />
                              <Route path="marketing-management" element={<Navigate to="/admin-app/vouchers" replace />} />
                              <Route path="content-management" element={<Navigate to="/admin-app/reviews" replace />} />
                              <Route path="security-management" element={<Navigate to="/admin-app/roles" replace />} />
                              <Route path="orders" element={<AdminOrderManagement />} />
                              <Route path="orders/direct" element={<AdminDirectOrdersPage />} />
                              <Route path="orders/vendor" element={<AdminSellerOrdersPage />} />
                              <Route path="seller-orders" element={<AdminSellerOrdersPage />} />
                              <Route path="users" element={<AdminUserDirectory />} />
                              <Route path="sellers" element={<AdminSellersDirectory />} />
                              <Route path="sellers/:sellerId" element={<AdminSellerDetailPage />} />
                              <Route path="products" element={<AdminProductCatalog />} />
                              <Route path="categories" element={<AdminCategoryManager />} />
                              <Route path="approvals" element={<AdminProductApprovals />} />
                              <Route path="seller-kyc" element={<AdminSellerKyc />} />
                              <Route path="seller-kyc/:sellerId" element={<AdminSellerDetail />} />
                              <Route path="returns" element={<AdminReturnsPage />} />
                              <Route path="cancellations" element={<AdminCancellationsPage />} />
                              <Route path="cancelled" element={<AdminCancelledOrdersPage />} />
                              <Route path="analytics" element={<AdminAnalyticsPage />} />
                              <Route path="reviews" element={<AdminReviewsPage />} />
                              <Route path="qa" element={<AdminQAModerationPage />} />
                              {/* Flash sales removed */}
                              <Route path="vouchers" element={<VoucherManager />} />
                              <Route path="banners" element={<BannerManager />} />
                              <Route path="subscriptions" element={<AdminSubscriptionPage />} />
                              <Route path="balance-adjustments" element={<AdminBalanceAdjustmentsPage />} />
                              <Route path="payment-methods" element={<AdminPaymentMethodsPage />} />
                              <Route path="payment-settings" element={<AdminPaymentSettingsPage />} />
                              <Route path="deposits/sellers" element={<AdminSellerDepositsPage />} />
                              <Route path="deposits/users" element={<AdminUserDepositsPage />} />
                              <Route path="deposits/settings" element={<AdminDepositSettings />} />
                              <Route path="payouts" element={<AdminPayoutManagement />} />
                              <Route path="roles" element={<AdminRolesPage />} />
                              <Route path="notifications" element={<AdminNotificationsPage />} />
                              <Route path="wallet" element={<AdminWalletPage />} />
                              <Route path="settings" element={<AdminAllSettingsPage />} />
                              <Route path="site-settings" element={<SocialSettingsPage />} />
                              <Route path="brand-assets" element={<AdminBrandAssetsPage />} />
                              <Route path="content-manager" element={<AdminSiteContentPage />} />
                              <Route path="chat-shortcuts" element={<AdminChatShortcutsPage />} />
                              <Route path="commission-management" element={<AdminCommissionManagementPage />} />
                              <Route path="security" element={<AdminSecurityPage />} />
                              <Route path="bulk-uploads" element={<AdminBulkUploadLogs />} />
                              <Route path="pending-commissions" element={<AdminPendingCommissionsPage />} />
                              <Route path="tracking-search" element={<AdminTrackingSearchPage />} />
                            </Route>
                          )}

                           {/* Agent App - /agent-app - agent domain (and dev/preview) */}
                           {((domainRole === 'agent') || devAllowsAll) && (
                             <Route path="/agent-app" element={<AgentAppShell />}>
                               <Route index element={<AgentDashboardHome />} />
                              <Route path="chats" element={<AgentChatsPage />} />
                              <Route path="earnings" element={<AgentEarningsPage />} />
                              <Route path="performance" element={<AgentPerformancePage />} />
                              <Route path="settings" element={<AgentSettingsPage />} />
                            </Route>
                          )}

                          {/* Legacy route redirects */}
                          <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
                          <Route path="/admin-dashboard/*" element={<Navigate to="/admin/dashboard" replace />} />
                          <Route path="/seller-center" element={<Navigate to="/seller/dashboard" replace />} />
                          <Route path="/seller-center/*" element={<Navigate to="/seller/dashboard" replace />} />
                          
                           {/* QR Login Confirm */}
                           <Route path="/qr-confirm" element={<QRConfirmPage />} />
                           
                           {/* Forbidden Route */}
                           <Route path="/forbidden" element={<Forbidden />} />
                          
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </BrowserRouter>
                    </TooltipProvider>
                  </MaintenanceGuard>
                </OrderStatusNotification>
                </ComparisonProvider>
              </CartProvider>
            </VisualEditProvider>
            </ImpersonationProvider>
        </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </HelmetProvider>
</ErrorBoundary>
);

export default App;
