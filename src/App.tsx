import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { VisualEditProvider } from "@/contexts/VisualEditContext";
import AuthModal from "@/components/auth/AuthModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MaintenanceGuard from "@/components/MaintenanceGuard";
import ErrorBoundary from "@/components/ErrorBoundary";
import OfflineIndicator from "@/components/OfflineIndicator";
import OrderStatusNotification from "./components/orders/OrderStatusNotification";
import ComparisonBar from "./components/comparison/ComparisonBar";
import VisualEditToggle from "./components/admin/VisualEditToggle";
// BackToDashboardBar removed - strict role isolation
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SellerAuth from "./pages/seller/SellerAuth";
import BusinessAuth from "./pages/business/BusinessAuth";
import EmailVerificationPending from "./pages/business/EmailVerificationPending";
import EmailVerificationSuccess from "./pages/business/EmailVerificationSuccess";
import CustomerAuth from "./pages/auth/CustomerAuth";
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
import { useAdminInactivityLogout } from "./hooks/useAdminInactivityLogout";
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
import SellerApprovals from "./pages/dashboard/SellerApprovals";
import AdminSettings from "./pages/dashboard/DashboardSettings";
import AdminSellerKyc from "./pages/dashboard/AdminSellerKyc";
import AdminSellerDetail from "./pages/dashboard/AdminSellerDetail";
import AdminPayoutManagement from "./pages/dashboard/AdminPayoutManagement";
import FlashSaleManager from "./pages/dashboard/FlashSaleManager";
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
import AdminFlashNominations from "./pages/dashboard/AdminFlashNominations";
import AdminQAModerationPage from "./pages/dashboard/AdminQAModerationPage";
import AdminCancelledOrdersPage from "./pages/admin/AdminCancelledOrdersPage";
import AdminSubscriptionPage from "./pages/dashboard/AdminSubscriptionPage";
import AdminDepositSettings from "./pages/dashboard/AdminDepositSettings";
import AdminSellerDepositsPage from "./pages/dashboard/AdminSellerDepositsPage";
import AdminUserDepositsPage from "./pages/dashboard/AdminUserDepositsPage";
import AdminBalanceAdjustmentsPage from "./pages/dashboard/AdminBalanceAdjustmentsPage";
import AdminPaymentMethodsPage from "./pages/dashboard/AdminPaymentMethodsPage";
import AdminPaymentSettingsPage from "./pages/dashboard/AdminPaymentSettingsPage";
import AdminAllSettingsPage from "./pages/dashboard/AdminAllSettingsPage";
import AdminDirectOrdersPage from "./pages/dashboard/AdminDirectOrdersPage";
import AdminVendorOrdersPage from "./pages/dashboard/AdminVendorOrdersPage";
import AdminChatShortcutsPage from "./pages/dashboard/AdminChatShortcutsPage";
import AdminSiteContentPage from "./pages/dashboard/AdminSiteContentPage";
import AdminBrandAssetsPage from "./pages/dashboard/AdminBrandAssetsPage";
import AdminNotificationsPage from "./pages/dashboard/AdminNotificationsPage";
import AdminCommissionManagementPage from "./pages/dashboard/AdminCommissionManagementPage";
import AdminWalletPage from "./pages/dashboard/AdminWalletPage";

// Seller Sub-Pages
import SellerKyc from "./pages/seller/SellerKyc";
import SellerWalletPage from "./pages/seller/SellerWalletPage";
import SellerMessagesPage from "./pages/seller/SellerMessagesPage";
import SellerAnalyticsPage from "./pages/seller/SellerAnalyticsPage";
import VerifiedSellerGuard from "./components/seller/VerifiedSellerGuard";
import SellerFlashSalePage from "./pages/seller/SellerFlashSalePage";
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
import AgentDashboard from "./pages/agent/AgentDashboard";

// PWA App Shells
import CustomerAppShell from "./components/pwa/CustomerAppShell";
import SellerAppShell from "./components/pwa/SellerAppShell";
import AdminAppShell from "./components/pwa/AdminAppShell";
import AgentAppShell from "./components/pwa/AgentAppShell";
import CustomerAppHome from "./pages/pwa/CustomerAppHome";

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

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
           <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
           <AuthProvider>
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
                          <SystemAnnouncementBanner />
                          {/* Strict role isolation - no cross-role features */}
                          <InstallPrompt />
                          <NotificationPermissionBanner />
                          <AdminInactivityGuard />
                          <AuthModal />
                          <SupportChatWidget />
                          <WhatsAppFloatingButton />
                          <ComparisonBar />
                          <MobileFloatingBackButton />
                          <VisualEditToggle />
                          <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/auth" element={<Auth />} />
                          
                          {/* Customer Auth Routes - /auth/* */}
                          <Route path="/auth/login" element={<CustomerAuth />} />
                          <Route path="/auth/signup" element={<CustomerAuth />} />
                          
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
                          
                          <Route path="/products" element={<ProductListing />} />
                          <Route path="/category/:slug" element={<CategoryPage />} />
                          <Route path="/search" element={<ProductListing />} />
                          <Route path="/product/:id" element={<ProductDetail />} />
                          <Route path="/compare" element={<ComparePage />} />
                          <Route path="/help" element={<HelpCenter />} />
                          <Route path="/contact" element={<ContactUs />} />
                          <Route path="/track-order" element={<TrackOrder />} />
                          <Route path="/store/:sellerId" element={<SellerStorefront />} />
                          
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
                          
                          {/* Customer Account Routes */}
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
                          </Route>
                          <Route path="/my-orders" element={<Navigate to="/account/orders" replace />} />
                          
                          {/* Admin Routes - Nested under sidebar layout */}
                          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboardLayout /></ProtectedRoute>}>
                            <Route path="dashboard" element={<AdminDashboardHome />} />
                            <Route path="users" element={<AdminUserDirectory />} />
                            <Route path="sellers" element={<AdminSellersDirectory />} />
                            <Route path="sellers/:sellerId" element={<AdminSellerDetailPage />} />
                            <Route path="roles" element={<AdminRolesPage />} />
                            <Route path="orders" element={<AdminOrderManagement />} />
                            <Route path="orders/direct" element={<AdminDirectOrdersPage />} />
                            <Route path="orders/vendor" element={<AdminVendorOrdersPage />} />
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
                            <Route path="flash-sales" element={<FlashSaleManager />} />
                            <Route path="flash-nominations" element={<AdminFlashNominations />} />
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
                            <Route path="wallet" element={<AdminWalletPage />} />
                          </Route>

                          {/* Seller Routes - Nested under sidebar layout */}
                          <Route path="/seller" element={<ProtectedRoute allowedRoles={["seller"]}><SellerDashboardLayout /></ProtectedRoute>}>
                            <Route path="dashboard" element={<SellerDashboardHome />} />
                            <Route path="kyc" element={<SellerKyc />} />
                            <Route path="products" element={<VerifiedSellerGuard><SellerProductsPage /></VerifiedSellerGuard>} />
                            <Route path="products/new" element={<VerifiedSellerGuard><SellerAddProductPage /></VerifiedSellerGuard>} />
                            <Route path="orders" element={<VerifiedSellerGuard><AdminOrderManagement /></VerifiedSellerGuard>} />
                            <Route path="vouchers" element={<VerifiedSellerGuard><SellerVouchersPage /></VerifiedSellerGuard>} />
                            <Route path="reviews" element={<SellerReviewsPage />} />
                            <Route path="qa" element={<VerifiedSellerGuard><SellerQAPage /></VerifiedSellerGuard>} />
                            <Route path="bulk-upload" element={<VerifiedSellerGuard><SellerBulkUploadPage /></VerifiedSellerGuard>} />
                            <Route path="flash-sale" element={<SellerFlashSalePage />} />
                            <Route path="messages" element={<VerifiedSellerGuard><SellerMessagesPage /></VerifiedSellerGuard>} />
                            <Route path="wallet" element={<VerifiedSellerGuard><SellerWalletPage /></VerifiedSellerGuard>} />
                            <Route path="analytics" element={<VerifiedSellerGuard><SellerAnalyticsPage /></VerifiedSellerGuard>} />
                            <Route path="returns" element={<VerifiedSellerGuard><SellerReturnsPage /></VerifiedSellerGuard>} />
                            <Route path="cancelled" element={<VerifiedSellerGuard><SellerCancelledOrdersPage /></VerifiedSellerGuard>} />
                            <Route path="settings" element={<SellerSettingsPage />} />
                            <Route path="fee-guide" element={<SellerFeeGuidePage />} />
                          </Route>

                          {/* Support Agent Routes */}
                          <Route path="/agent/dashboard" element={<ProtectedRoute allowedRoles={["support_agent"]}><AgentDashboard /></ProtectedRoute>} />

                          {/* === PWA Mobile Apps === */}
                          {/* Customer App - /app */}
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

                          {/* Seller App - /seller-app */}
                          <Route path="/seller-app" element={<SellerAppShell />}>
                            <Route index element={<SellerDashboardHome />} />
                            <Route path="products" element={<VerifiedSellerGuard><SellerProductsPage /></VerifiedSellerGuard>} />
                            <Route path="products/new" element={<VerifiedSellerGuard><SellerAddProductPage /></VerifiedSellerGuard>} />
                            <Route path="orders" element={<VerifiedSellerGuard><AdminOrderManagement /></VerifiedSellerGuard>} />
                            <Route path="wallet" element={<VerifiedSellerGuard><SellerWalletPage /></VerifiedSellerGuard>} />
                            <Route path="messages" element={<VerifiedSellerGuard><SellerMessagesPage /></VerifiedSellerGuard>} />
                            <Route path="analytics" element={<VerifiedSellerGuard><SellerAnalyticsPage /></VerifiedSellerGuard>} />
                            <Route path="reviews" element={<SellerReviewsPage />} />
                            <Route path="vouchers" element={<VerifiedSellerGuard><SellerVouchersPage /></VerifiedSellerGuard>} />
                            <Route path="returns" element={<VerifiedSellerGuard><SellerReturnsPage /></VerifiedSellerGuard>} />
                            <Route path="cancelled" element={<VerifiedSellerGuard><SellerCancelledOrdersPage /></VerifiedSellerGuard>} />
                            <Route path="flash-sale" element={<SellerFlashSalePage />} />
                            <Route path="bulk-upload" element={<VerifiedSellerGuard><SellerBulkUploadPage /></VerifiedSellerGuard>} />
                            <Route path="settings" element={<SellerSettingsPage />} />
                            <Route path="fee-guide" element={<SellerFeeGuidePage />} />
                            <Route path="kyc" element={<SellerKyc />} />
                          </Route>

                          {/* Admin App - /admin-app */}
                          <Route path="/admin-app" element={<AdminAppShell />}>
                            <Route index element={<AdminDashboardHome />} />
                            <Route path="orders" element={<AdminOrderManagement />} />
                            <Route path="orders/direct" element={<AdminDirectOrdersPage />} />
                            <Route path="orders/vendor" element={<AdminVendorOrdersPage />} />
                            <Route path="users" element={<AdminUserDirectory />} />
                            <Route path="sellers" element={<AdminSellersDirectory />} />
                            <Route path="sellers/:sellerId" element={<AdminSellerDetailPage />} />
                            <Route path="products" element={<AdminProductCatalog />} />
                            <Route path="categories" element={<AdminCategoryManager />} />
                            <Route path="approvals" element={<AdminProductApprovals />} />
                            <Route path="seller-kyc" element={<AdminSellerKyc />} />
                            <Route path="returns" element={<AdminReturnsPage />} />
                            <Route path="cancellations" element={<AdminCancellationsPage />} />
                            <Route path="analytics" element={<AdminAnalyticsPage />} />
                            <Route path="reviews" element={<AdminReviewsPage />} />
                            <Route path="flash-sales" element={<FlashSaleManager />} />
                            <Route path="vouchers" element={<VoucherManager />} />
                            <Route path="banners" element={<BannerManager />} />
                            <Route path="subscriptions" element={<AdminSubscriptionPage />} />
                            <Route path="balance-adjustments" element={<AdminBalanceAdjustmentsPage />} />
                            <Route path="payment-methods" element={<AdminPaymentMethodsPage />} />
                            <Route path="payment-settings" element={<AdminPaymentSettingsPage />} />
                            <Route path="deposits/sellers" element={<AdminSellerDepositsPage />} />
                            <Route path="deposits/users" element={<AdminUserDepositsPage />} />
                            <Route path="roles" element={<AdminRolesPage />} />
                            <Route path="notifications" element={<AdminNotificationsPage />} />
                            <Route path="wallet" element={<AdminWalletPage />} />
                            <Route path="settings" element={<AdminAllSettingsPage />} />
                            <Route path="brand-assets" element={<AdminBrandAssetsPage />} />
                            <Route path="content-manager" element={<AdminSiteContentPage />} />
                            <Route path="commission-management" element={<AdminCommissionManagementPage />} />
                          </Route>

                          {/* Agent App - /agent-app */}
                          <Route path="/agent-app" element={<AgentAppShell />}>
                            <Route index element={<AgentDashboard />} />
                          </Route>

                          {/* Legacy route redirects */}
                          <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
                          <Route path="/admin-dashboard/*" element={<Navigate to="/admin/dashboard" replace />} />
                          <Route path="/seller-center" element={<Navigate to="/seller/dashboard" replace />} />
                          <Route path="/seller-center/*" element={<Navigate to="/seller/dashboard" replace />} />
                          
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
        </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </HelmetProvider>
</ErrorBoundary>
);

export default App;
